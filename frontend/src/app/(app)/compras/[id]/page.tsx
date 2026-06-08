"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Trash2, CheckCircle, PackageCheck, XCircle } from "lucide-react";
import { useCompra, useDeleteCompra, useUpdateCompraStatus } from "@/lib/hooks/use-compras";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusPill } from "@/components/shared/status-pill";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatBRL, todayISO } from "@/lib/utils/format";
import { Loader2 } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function CompraDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { data: compra, isLoading } = useCompra(id);
  const deleteCompra = useDeleteCompra();
  const updateStatus = useUpdateCompraStatus();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [receberOpen, setReceberOpen] = useState(false);
  const [dataRecebimento, setDataRecebimento] = useState(todayISO());

  async function handleAcao(acao: "confirmar" | "cancelar") {
    try {
      await updateStatus.mutateAsync({ id, acao });
      toast.success(acao === "confirmar" ? "Pedido confirmado!" : "Compra cancelada!");
    } catch { toast.error("Erro ao atualizar status."); }
  }

  async function handleReceber() {
    try {
      await updateStatus.mutateAsync({ id, acao: "receber" });
      toast.success("Compra marcada como recebida!");
      setReceberOpen(false);
    } catch { toast.error("Erro ao marcar como recebido."); }
  }

  async function handleDelete() {
    try { await deleteCompra.mutateAsync(id); toast.success("Compra excluída!"); router.push("/compras"); }
    catch { toast.error("Erro ao excluir."); }
  }

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!compra) return <p className="text-muted-foreground">Compra não encontrada.</p>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.back()}><ArrowLeft className="w-4 h-4" /></Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Despesa — {compra.categoria ?? compra.fornecedor}</h1>
          <p className="text-sm text-muted-foreground">{formatDate(compra.dataPedido)}</p>
        </div>
        <StatusPill status={compra.status} />
        <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />Excluir
        </Button>
      </div>

      {/* Ações */}
      <div className="flex flex-wrap gap-2 mb-6">
        {compra.status === "pendente" && (
          <>
            <Button size="sm" onClick={() => handleAcao("confirmar")} disabled={updateStatus.isPending}>
              {updateStatus.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Confirmar Pedido
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAcao("cancelar")} disabled={updateStatus.isPending} className="text-destructive border-destructive hover:bg-destructive/10">
              <XCircle className="w-4 h-4 mr-2" />Cancelar
            </Button>
          </>
        )}
        {compra.status === "confirmado" && (
          <>
            <Button size="sm" onClick={() => setReceberOpen(true)}>
              <PackageCheck className="w-4 h-4 mr-2" />Marcar como Recebido
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAcao("cancelar")} className="text-destructive border-destructive hover:bg-destructive/10">
              <XCircle className="w-4 h-4 mr-2" />Cancelar
            </Button>
          </>
        )}
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          ["Categoria", compra.categoria ?? "—"],
          ["Fornecedor / Fonte", compra.fornecedor],
          ["Forma de Pagamento", compra.formaPag ?? "—"],
          ["Data", formatDate(compra.dataPedido)],
          ["Recebimento", formatDate(compra.dataRecebimento)],
        ].map(([label, value]) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
            <p className="text-sm font-medium">{value}</p>
          </div>
        ))}
      </div>

      {/* Descrição simples (categorias não-produtos) */}
      {compra.descricaoSimples && (
        <div className="bg-card rounded-xl border border-border p-4 mb-6 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Descrição da despesa</p>
          <p className="text-sm text-foreground leading-relaxed">{compra.descricaoSimples}</p>
          <div className="mt-4 flex justify-end">
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Total</p>
              <p className="text-2xl font-bold text-primary font-mono">{formatBRL(compra.total)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Itens (Produtos Pets) */}
      {compra.itens.length > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-sm font-semibold">Produtos Adquiridos</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Produto</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Qtd</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Peso (kg)</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Custo Unit.</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody>
              {compra.itens.map((item) => (
                <tr key={item.id} className="border-t border-border">
                  <td className="px-4 py-3">{item.nome}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{item.qtd}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground hidden sm:table-cell">
                    {item.pesoKg != null ? `${item.pesoKg} kg` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-muted-foreground">{formatBRL(item.valorUnitario)}</td>
                  <td className="px-4 py-3 text-right font-mono font-semibold">{formatBRL(item.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-accent/30">
                <td colSpan={4} className="px-4 py-3 text-right font-semibold text-sm">Total</td>
                <td className="px-4 py-3 text-right font-bold text-primary font-mono text-lg">{formatBRL(compra.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Receber Dialog */}
      <Dialog open={receberOpen} onOpenChange={setReceberOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Marcar como Recebido</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Data de Recebimento</Label>
              <Input type="date" value={dataRecebimento} onChange={(e) => setDataRecebimento(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReceberOpen(false)}>Cancelar</Button>
              <Button onClick={handleReceber} disabled={updateStatus.isPending}>
                {updateStatus.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirmar Recebimento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="Excluir despesa?" description="Esta ação não pode ser desfeita." onConfirm={handleDelete} loading={deleteCompra.isPending} />
    </div>
  );
}
