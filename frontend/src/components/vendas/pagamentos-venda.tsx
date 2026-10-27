"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, Plus, Trash2, Loader2 } from "lucide-react";
import type { Venda, FormaPag } from "@/lib/types/venda";
import { useRegistrarPagamento, useRemoverPagamento } from "@/lib/hooks/use-vendas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatBRL, formatDate, todayLocalISO } from "@/lib/utils/format";

const FORMAS: FormaPag[] = ["Pix", "Dinheiro", "Cartão Débito", "Cartão Crédito", "Boleto"];

function mensagemErro(err: unknown): string | undefined {
  return (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
}

/**
 * Quadro "Pagamento" da venda: total, recebido, em aberto, histórico de recebimentos
 * e registro de novos recebimentos (specs/vendas/spec-v6.md).
 */
export function PagamentosVenda({ venda }: { venda: Venda }) {
  const registrar = useRegistrarPagamento();
  const remover = useRemoverPagamento();

  const valorPago = venda.valorPago ?? venda.total;
  const emAberto = venda.valorEmAberto ?? 0;
  const pagamentos = venda.pagamentos ?? [];
  const valorNoAto = venda.valorRecebido ?? venda.total;

  const [aberto, setAberto] = useState(false);
  const [valor, setValor] = useState("");
  const [data, setData] = useState(todayLocalISO);
  const [formaPag, setFormaPag] = useState<FormaPag>("Pix");
  const [obs, setObs] = useState("");
  const [removerId, setRemoverId] = useState<string | null>(null);

  function abrir() {
    setValor(String(emAberto));
    setData(todayLocalISO());
    setFormaPag("Pix");
    setObs("");
    setAberto(true);
  }

  async function handleRegistrar() {
    const v = Number(valor);
    if (!(v > 0)) { toast.error("Informe o valor recebido."); return; }
    if (v > emAberto + 0.005) { toast.error(`O valor não pode passar do que está em aberto (${formatBRL(emAberto)}).`); return; }
    if (!data || data > todayLocalISO()) { toast.error("Informe uma data que não seja no futuro."); return; }
    try {
      await registrar.mutateAsync({ id: venda.id, input: { valor: v, data, formaPag, obs: obs.trim() || undefined } });
      toast.success(v >= emAberto - 0.005 ? "Venda quitada!" : "Recebimento registrado!");
      setAberto(false);
    } catch (err) {
      toast.error("Erro ao registrar recebimento", { description: mensagemErro(err) });
    }
  }

  async function handleRemover() {
    if (!removerId) return;
    try {
      await remover.mutateAsync({ id: venda.id, pagamentoId: removerId });
      toast.success("Recebimento excluído.");
      setRemoverId(null);
    } catch (err) {
      toast.error("Erro ao excluir recebimento", { description: mensagemErro(err) });
    }
  }

  return (
    <div className={`rounded-xl border p-5 shadow-sm mb-6 ${emAberto > 0 ? "border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20" : "border-border bg-card"}`}>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {emAberto > 0 ? (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" /> Pagamento — valor em aberto
          </p>
        ) : (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" /> Pagamento — quitado
          </p>
        )}
        {emAberto > 0 && (
          <Button size="sm" className="ml-auto" onClick={abrir}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Registrar recebimento
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Total</p>
          <p className="font-mono font-semibold">{formatBRL(venda.total)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Recebido</p>
          <p className="font-mono font-semibold">{formatBRL(valorPago)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Em aberto</p>
          <p className={`font-mono font-bold ${emAberto > 0 ? "text-amber-700 dark:text-amber-400" : ""}`} data-testid="valor-em-aberto">
            {formatBRL(emAberto)}
          </p>
        </div>
      </div>

      {(pagamentos.length > 0 || valorNoAto < venda.total) && (
        <div className="mt-4 border-t border-border/60 pt-3 space-y-1.5 text-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Histórico</p>
          <div className="flex justify-between gap-3">
            <span>{formatDate(venda.data)} · na venda ({venda.formaPag})</span>
            <span className="font-mono">{formatBRL(valorNoAto)}</span>
          </div>
          {pagamentos.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-3">
              <span className="min-w-0 break-words">
                {formatDate(p.data)} · {p.formaPag}
                {p.obs ? <span className="text-muted-foreground"> — {p.obs}</span> : null}
              </span>
              <span className="flex items-center gap-1 shrink-0">
                <span className="font-mono">{formatBRL(p.valor)}</span>
                <Button
                  variant="ghost" size="sm"
                  className="h-7 w-7 p-0 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                  title="Excluir recebimento"
                  onClick={() => setRemoverId(p.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </span>
            </div>
          ))}
        </div>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar recebimento</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Em aberto nesta venda: <strong className="text-foreground">{formatBRL(emAberto)}</strong></p>
            <div className="space-y-1.5">
              <Label htmlFor="pag-valor">Valor recebido (R$) *</Label>
              <Input id="pag-valor" type="number" step="0.01" min="0" max={emAberto} value={valor} onChange={(e) => setValor(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pag-data">Data *</Label>
                <Input id="pag-data" type="date" value={data} max={todayLocalISO()} onChange={(e) => setData(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Forma *</Label>
                <Select value={formaPag} onValueChange={(v) => { if (v) setFormaPag(v as FormaPag); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FORMAS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pag-obs">Observação</Label>
              <Textarea id="pag-obs" rows={2} value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex.: pagou o restante na entrega" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
              <Button onClick={handleRegistrar} disabled={registrar.isPending}>
                {registrar.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Registrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!removerId}
        onOpenChange={(o) => { if (!o) setRemoverId(null); }}
        title="Excluir recebimento?"
        description="O valor volta a ficar em aberto na venda."
        confirmLabel="Excluir"
        onConfirm={handleRemover}
        loading={remover.isPending}
      />
    </div>
  );
}
