"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Trash2, CheckCircle, XCircle, RotateCcw, RefreshCw, FileDown } from "lucide-react";
import {
  useOrcamento,
  useDeleteOrcamento,
  useUpdateOrcamentoStatus,
  useConverterOrcamento,
} from "@/lib/hooks/use-orcamentos";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/shared/status-pill";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FormaPagSelect } from "@/components/vendas/forma-pag-select";
import { formatDate, formatBRL } from "@/lib/utils/format";
import { Loader2 } from "lucide-react";
import { apiClientes } from "@/lib/api/clientes";
import { apiAnimais } from "@/lib/api/animais";
import { gerarOrcamentoPDF } from "@/lib/utils/orcamento-pdf";

interface Props {
  params: Promise<{ id: string }>;
}

export default function OrcamentoDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const { data: orcamento, isLoading } = useOrcamento(id);
  const deleteOrcamento = useDeleteOrcamento();
  const updateStatus = useUpdateOrcamentoStatus();
  const converter = useConverterOrcamento();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [converterOpen, setConverterOpen] = useState(false);
  const [formaPag, setFormaPag] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  async function handleStatus(acao: "aprovar" | "recusar" | "reabrir") {
    try {
      await updateStatus.mutateAsync({ id, acao });
      toast.success(`Orçamento ${acao === "aprovar" ? "aprovado" : acao === "recusar" ? "recusado" : "reaberto"}!`);
    } catch {
      toast.error("Erro ao atualizar status.");
    }
  }

  async function handleConverter() {
    if (!formaPag) { toast.error("Selecione a forma de pagamento."); return; }
    try {
      const venda = await converter.mutateAsync({ id, input: { formaPag: formaPag as never } });
      toast.success("Orçamento convertido em venda!");
      router.push(`/vendas/${venda.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error("Erro ao converter", { description: msg });
    }
  }

  async function handleDelete() {
    try { await deleteOrcamento.mutateAsync(id); toast.success("Orçamento excluído!"); router.push("/orcamentos"); }
    catch { toast.error("Erro ao excluir."); }
  }

  async function handleDownloadPDF() {
    if (!orcamento || !orcamento.clienteId) return;
    setPdfLoading(true);
    try {
      const [cliente, animal] = await Promise.all([
        apiClientes.get(orcamento.clienteId),
        orcamento.animalId ? apiAnimais.get(orcamento.animalId) : Promise.resolve(null),
      ]);
      gerarOrcamentoPDF(orcamento, cliente, animal);
      toast.success("PDF gerado com sucesso!");
    } catch {
      toast.error("Erro ao gerar o PDF.");
    } finally {
      setPdfLoading(false);
    }
  }

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!orcamento) return <p className="text-muted-foreground">Orçamento não encontrado.</p>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.back()}><ArrowLeft className="w-4 h-4" /></Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Orçamento #{id.slice(-6).toUpperCase()}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(orcamento.data)}</p>
        </div>
        <StatusPill status={orcamento.status} />
        <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={pdfLoading}>
          {pdfLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5 mr-1.5" />}
          Baixar PDF
        </Button>
        <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />Excluir
        </Button>
      </div>

      {/* Ações de status */}
      <div className="flex flex-wrap gap-2 mb-6">
        {orcamento.status === "pendente" && (
          <>
            <Button size="sm" onClick={() => handleStatus("aprovar")} disabled={updateStatus.isPending} className="bg-[#00897b] hover:bg-[#004d40] text-white">
              {updateStatus.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Aprovar
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleStatus("recusar")} disabled={updateStatus.isPending} className="text-destructive border-destructive hover:bg-destructive/10">
              <XCircle className="w-4 h-4 mr-2" />Recusar
            </Button>
          </>
        )}
        {orcamento.status === "recusado" && (
          <Button size="sm" variant="outline" onClick={() => handleStatus("reabrir")} disabled={updateStatus.isPending} className="text-amber-700 border-amber-400 hover:bg-amber-50">
            <RotateCcw className="w-4 h-4 mr-2" />Reabrir
          </Button>
        )}
        {orcamento.status === "aprovado" && !orcamento.vendaId && (
          <Button size="sm" onClick={() => setConverterOpen(true)}>
            <RefreshCw className="w-4 h-4 mr-2" />Converter para Venda
          </Button>
        )}
        {orcamento.vendaId && (
          <Button size="sm" variant="outline" onClick={() => router.push(`/vendas/${orcamento.vendaId}`)}>
            Ver Venda gerada →
          </Button>
        )}
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          ["Cliente", orcamento.cliente?.nome ?? "—"],
          ["Animal", orcamento.animal?.nome ?? "—"],
          ["Data", formatDate(orcamento.data)],
          ["Validade", formatDate(orcamento.validade)],
        ].map(([label, value]) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
            <p className="text-sm font-medium">{value}</p>
          </div>
        ))}
      </div>

      {/* Itens */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border">
          <p className="text-sm font-semibold">Itens do Orçamento</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Produto / Serviço</th>
              <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Qtd</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Valor Unit.</th>
              <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Total</th>
            </tr>
          </thead>
          <tbody>
            {orcamento.itens.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="px-4 py-3">{item.nome}</td>
                <td className="px-4 py-3 text-center text-muted-foreground">{item.qtd}</td>
                <td className="px-4 py-3 text-right font-mono text-muted-foreground">{formatBRL(item.valorUnitario)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold">{formatBRL(item.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-accent/30">
              <td colSpan={3} className="px-4 py-3 text-right font-semibold text-sm">Total</td>
              <td className="px-4 py-3 text-right font-bold text-primary font-mono text-lg">{formatBRL(orcamento.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Converter Dialog */}
      <Dialog open={converterOpen} onOpenChange={setConverterOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Converter em Venda</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Selecione a forma de pagamento para criar a venda correspondente.</p>
            <div className="space-y-1.5">
              <Label>Forma de Pagamento *</Label>
              <FormaPagSelect value={formaPag} onValueChange={setFormaPag} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConverterOpen(false)}>Cancelar</Button>
              <Button onClick={handleConverter} disabled={converter.isPending || !formaPag}>
                {converter.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Converter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Excluir orçamento?" description="Esta ação não pode ser desfeita." onConfirm={handleDelete} loading={deleteOrcamento.isPending} />
    </div>
  );
}
