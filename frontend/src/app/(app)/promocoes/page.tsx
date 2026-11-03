"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, CircleStop } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PromocaoDialog } from "@/components/promocoes/promocao-dialog";
import { usePromocoes, useEncerrarPromocao, useExcluirPromocao } from "@/lib/hooks/use-promocoes";
import { formatBRL } from "@/lib/utils/format";
import type { Promocao, SituacaoPromocao } from "@/lib/types/promocao";

const SITUACAO: Record<SituacaoPromocao, { label: string; className: string }> = {
  ativa: { label: "Ativa", className: "bg-emerald-50 text-emerald-800 border-emerald-300" },
  agendada: { label: "Agendada", className: "bg-amber-50 text-amber-800 border-amber-300" },
  encerrada: { label: "Encerrada", className: "bg-muted text-muted-foreground border-border" },
};

const ORDEM: Record<SituacaoPromocao, number> = { ativa: 0, agendada: 1, encerrada: 2 };

function dataBR(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

function mensagemErro(err: unknown): string | undefined {
  return (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
}

export default function PromocoesPage() {
  const { data, isLoading, isError } = usePromocoes();
  const encerrar = useEncerrarPromocao();
  const excluir = useExcluirPromocao();
  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<Promocao | undefined>();
  const [paraEncerrar, setParaEncerrar] = useState<Promocao | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Promocao | null>(null);

  const promocoes = [...(data ?? [])].sort((a, b) => ORDEM[a.situacao] - ORDEM[b.situacao] || b.inicio.localeCompare(a.inicio));

  async function confirmarEncerrar() {
    if (!paraEncerrar) return;
    try {
      await encerrar.mutateAsync(paraEncerrar.id);
      toast.success("Promoção encerrada. Os produtos voltaram ao preço normal.");
    } catch (err) {
      toast.error("Erro ao encerrar promoção", { description: mensagemErro(err) });
    } finally {
      setParaEncerrar(null);
    }
  }

  async function confirmarExcluir() {
    if (!paraExcluir) return;
    try {
      await excluir.mutateAsync(paraExcluir.id);
      toast.success("Promoção excluída.");
    } catch (err) {
      toast.error("Erro ao excluir promoção", { description: mensagemErro(err) });
    } finally {
      setParaExcluir(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Promoções</h1>
          <p className="text-sm text-muted-foreground">Preços promocionais com início e fim, no site e nas vendas</p>
        </div>
        <Button onClick={() => { setEditando(undefined); setDialogAberto(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Nova promoção
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : isError ? (
        <EmptyState message="Erro ao carregar promoções" description="Verifique a conexão com o servidor." />
      ) : promocoes.length === 0 ? (
        <EmptyState message="Nenhuma promoção cadastrada" description="Crie uma campanha, escolha os produtos e defina o preço promocional de cada um." />
      ) : (
        <div className="space-y-3">
          {promocoes.map((p) => {
            const s = SITUACAO[p.situacao];
            return (
              <article key={p.id} className="bg-card rounded-xl border border-border p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold">{p.nome}</h2>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${s.className}`}>{s.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {dataBR(p.inicio)} a {dataBR(p.fim)} · {p.itens.length} {p.itens.length === 1 ? "produto" : "produtos"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => { setEditando(p); setDialogAberto(true); }}>
                      <Pencil className="w-3.5 h-3.5" /> Editar
                    </Button>
                    {p.situacao !== "encerrada" && (
                      <Button variant="ghost" size="sm" className="h-8 gap-1 text-amber-700" onClick={() => setParaEncerrar(p)}>
                        <CircleStop className="w-3.5 h-3.5" /> Encerrar agora
                      </Button>
                    )}
                    {p.situacao !== "ativa" && (
                      <Button variant="ghost" size="sm" aria-label={`Excluir ${p.nome}`} className="h-8 w-8 p-0 text-destructive" onClick={() => setParaExcluir(p)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                  {p.itens.map((i) => (
                    <li key={i.produtoId} className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate">{i.nome}</span>
                      <span className="shrink-0 font-mono text-xs">
                        <span className="text-muted-foreground line-through mr-1.5">{formatBRL(i.valorVenda)}</span>
                        <span className="font-semibold">{formatBRL(i.valorPromocional)}</span>
                        <span className="ml-1.5 text-emerald-700">-{i.desconto}%</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      )}

      <PromocaoDialog open={dialogAberto} onOpenChange={(o) => { setDialogAberto(o); if (!o) setEditando(undefined); }} promocao={editando} />
      <ConfirmDialog
        open={!!paraEncerrar}
        onOpenChange={(o) => { if (!o) setParaEncerrar(null); }}
        title="Encerrar promoção agora?"
        description="Os produtos voltam ao preço normal no sistema na hora e no site em até 5 minutos."
        confirmLabel="Encerrar"
        onConfirm={confirmarEncerrar}
        loading={encerrar.isPending}
      />
      <ConfirmDialog
        open={!!paraExcluir}
        onOpenChange={(o) => { if (!o) setParaExcluir(null); }}
        title="Excluir promoção?"
        description="A campanha e a lista de produtos dela são apagadas. Vendas já registradas não mudam."
        onConfirm={confirmarExcluir}
        loading={excluir.isPending}
      />
    </div>
  );
}
