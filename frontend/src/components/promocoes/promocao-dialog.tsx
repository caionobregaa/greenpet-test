"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Search, Trash2, AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/shared/money-input";
import { apiProdutos } from "@/lib/api/produtos";
import { useSalvarPromocao } from "@/lib/hooks/use-promocoes";
import { formatBRL } from "@/lib/utils/format";
import type { Produto } from "@/lib/types/produto";
import type { Promocao } from "@/lib/types/promocao";

interface ItemForm {
  produtoId: string;
  nome: string;
  valorVenda: number;
  valorCusto: number;
  valorPromocional?: number;
}

/** Desconto e margem com o preço promocional (specs/promocoes/spec-v1.md). */
export function analisarItem(item: Pick<ItemForm, "valorVenda" | "valorCusto" | "valorPromocional">) {
  const promo = item.valorPromocional;
  if (!promo || promo <= 0) return { desconto: null, margem: null, erro: null, margemNegativa: false };
  const desconto = Math.round((1 - promo / item.valorVenda) * 100);
  const margem = Math.round(((promo - item.valorCusto) / promo) * 100);
  const erro = promo >= item.valorVenda ? "Precisa ser menor que o preço normal" : null;
  return { desconto, margem, erro, margemNegativa: promo < item.valorCusto };
}

function hojeManaus(): string {
  return new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function mensagemErro(err: unknown): string | undefined {
  return (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
}

function BuscaProduto({ onEscolher, jaIncluidos }: { onEscolher: (p: Produto) => void; jaIncluidos: Set<string> }) {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<Produto[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function aoDigitar(v: string) {
    setBusca(v);
    clearTimeout(timer.current);
    if (!v.trim()) { setResultados([]); return; }
    timer.current = setTimeout(async () => {
      try {
        const { data } = await apiProdutos.list({ q: v, limit: 8 });
        setResultados(data);
      } catch {
        setResultados([]);
      }
    }, 300);
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
      <Input value={busca} onChange={(e) => aoDigitar(e.target.value)} placeholder="Buscar produto para incluir..." className="pl-8" />
      {resultados.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border/60 rounded-md shadow-md overflow-hidden">
          {resultados.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={jaIncluidos.has(p.id)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 border-b border-border/40 last:border-0 disabled:opacity-50"
              onClick={() => { onEscolher(p); setBusca(""); setResultados([]); }}
            >
              <p className="font-medium text-[13px]">{p.nome}</p>
              <p className="text-[11px] text-muted-foreground">
                {p.categoria} · {formatBRL(p.valorVenda)}{jaIncluidos.has(p.id) ? " · já incluído" : ""}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PromocaoDialog({
  open,
  onOpenChange,
  promocao,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promocao?: Promocao;
}) {
  const salvar = useSalvarPromocao();
  const [nome, setNome] = useState("");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [itens, setItens] = useState<ItemForm[]>([]);

  useEffect(() => {
    if (!open) return;
    setNome(promocao?.nome ?? "");
    setInicio(promocao?.inicio ?? hojeManaus());
    setFim(promocao?.fim ?? "");
    setItens(
      (promocao?.itens ?? []).map((i) => ({
        produtoId: i.produtoId, nome: i.nome, valorVenda: i.valorVenda, valorCusto: i.valorCusto, valorPromocional: i.valorPromocional,
      })),
    );
  }, [open, promocao]);

  const analises = itens.map(analisarItem);
  const faltaPreco = itens.some((i) => !i.valorPromocional);
  const temErro = analises.some((a) => a.erro);
  const periodoInvalido = !!inicio && !!fim && fim < inicio;
  const podeSalvar = !!nome.trim() && !!inicio && !!fim && !periodoInvalido && itens.length > 0 && !faltaPreco && !temErro;

  function incluir(p: Produto) {
    setItens((atual) => [...atual, { produtoId: p.id, nome: p.nome, valorVenda: p.valorVenda, valorCusto: p.valorCusto ?? 0 }]);
  }

  async function aoSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!podeSalvar) return;
    try {
      await salvar.mutateAsync({
        id: promocao?.id,
        input: { nome: nome.trim(), inicio, fim, itens: itens.map((i) => ({ produtoId: i.produtoId, valorPromocional: i.valorPromocional! })) },
      });
      toast.success(promocao ? "Promoção atualizada!" : "Promoção criada!");
      onOpenChange(false);
    } catch (err) {
      toast.error("Erro ao salvar promoção", { description: mensagemErro(err) ?? "Tente novamente." });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl sm:p-8 max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{promocao ? "Editar promoção" : "Nova promoção"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={aoSalvar} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
            <div className="space-y-1.5">
              <Label htmlFor="promo-nome">Nome da campanha *</Label>
              <Input id="promo-nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Semana do Gato" maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="promo-inicio">Início *</Label>
              <Input id="promo-inicio" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="promo-fim">Fim *</Label>
              <Input id="promo-fim" type="date" value={fim} min={inicio || undefined} onChange={(e) => setFim(e.target.value)} />
            </div>
          </div>
          {periodoInvalido && <p className="text-xs text-destructive">A data de fim não pode ser antes da data de início.</p>}
          <p className="text-xs text-muted-foreground">
            Vale das 00:00 do início às 23:59 do fim (horário de Manaus). Depois, os produtos voltam sozinhos ao preço normal.
          </p>

          <div className="space-y-2">
            <Label>Produtos</Label>
            <BuscaProduto onEscolher={incluir} jaIncluidos={new Set(itens.map((i) => i.produtoId))} />
          </div>

          {itens.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Busque e inclua os produtos que entram nesta promoção.
            </p>
          ) : (
            <div className="rounded-lg border border-border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="text-left px-3 py-2">Produto</th>
                    <th className="text-right px-3 py-2">Normal</th>
                    <th className="text-right px-3 py-2">Custo</th>
                    <th className="text-right px-3 py-2 w-40">Promocional</th>
                    <th className="text-right px-3 py-2">Desconto</th>
                    <th className="text-right px-3 py-2">Margem</th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item, i) => {
                    const a = analises[i];
                    return (
                      <tr key={item.produtoId} className="border-t border-border align-top">
                        <td className="px-3 py-2 font-medium">{item.nome}</td>
                        <td className="px-3 py-2 text-right font-mono text-muted-foreground">{formatBRL(item.valorVenda)}</td>
                        <td className="px-3 py-2 text-right font-mono text-muted-foreground">{formatBRL(item.valorCusto)}</td>
                        <td className="px-3 py-2">
                          <MoneyInput
                            value={item.valorPromocional}
                            onChange={(v) => setItens((atual) => atual.map((x, j) => (j === i ? { ...x, valorPromocional: v } : x)))}
                            className="text-right"
                          />
                          {a.erro && <p className="mt-1 text-[11px] text-destructive">{a.erro}</p>}
                        </td>
                        <td className="px-3 py-2 text-right font-mono">{a.desconto !== null ? `-${a.desconto}%` : "—"}</td>
                        <td className={`px-3 py-2 text-right font-mono ${a.margemNegativa ? "text-destructive font-semibold" : ""}`}>
                          {a.margem !== null ? `${a.margem}%` : "—"}
                          {a.margemNegativa && (
                            <span className="mt-1 flex items-center justify-end gap-1 text-[11px]" role="status">
                              <AlertTriangle className="w-3 h-3" /> abaixo do custo
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label={`Tirar ${item.nome} da promoção`}
                            className="h-8 w-8 p-0 text-destructive"
                            onClick={() => setItens((atual) => atual.filter((_, j) => j !== i))}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={!podeSalvar || salvar.isPending}>
              {salvar.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</> : "Salvar promoção"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
