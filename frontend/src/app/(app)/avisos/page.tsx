"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Plus,
  ClipboardList,
  BellRing,
  AlertTriangle,
} from "lucide-react";
import { useRecompra } from "@/lib/hooks/use-recompra";
import { useLembretes, useCreateLembrete, useDeleteLembrete } from "@/lib/hooks/use-lembretes";
import { useVendasSemCusto } from "@/lib/hooks/use-vendas";
import Link from "next/link";
import { LembreteMensagens } from "@/components/avisos/lembrete-mensagens";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils/format";
import { Skeleton } from "@/components/ui/skeleton";

// ── Página ────────────────────────────────────────────────────────────────────

export default function AvisosPage() {
  const { data: recompraData, isLoading } = useRecompra({ limit: 100 });
  const { data: semCustoData, isLoading: isLoadingSemCusto } = useVendasSemCusto();

  const alertasAviso = (recompraData?.data ?? []).filter((a) => a.diasRestantes <= 10);
  const pendentes = alertasAviso.filter((a) => !a.mensagemEnviadaEm).length;

  // ── Lembretes (backend) ──
  const { data: tarefas = [], isLoading: isLoadingTarefas } = useLembretes();
  const createLembrete = useCreateLembrete();
  const deleteLembrete = useDeleteLembrete();
  const [novaTarefa, setNovaTarefa] = useState("");
  const [pendingTarefaId, setPendingTarefaId] = useState<string | null>(null);

  async function adicionarTarefa() {
    const texto = novaTarefa.trim();
    if (!texto) return;
    try {
      await createLembrete.mutateAsync(texto);
      setNovaTarefa("");
    } catch {
      toast.error("Erro ao adicionar lembrete.");
    }
  }

  async function concluirTarefa() {
    if (!pendingTarefaId) return;
    try {
      await deleteLembrete.mutateAsync(pendingTarefaId);
      setPendingTarefaId(null);
      toast.success("Lembrete concluído!");
    } catch {
      toast.error("Erro ao concluir lembrete.");
      setPendingTarefaId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* ── Lembrete de mensagens (recompra) ───────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-1">
          <BellRing className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-semibold">Lembrete de mensagens — Recompra</h2>
          {!isLoading && pendentes > 0 && (
            <span className="bg-red-500 text-white text-[11px] font-bold rounded-full px-2 py-0.5">
              {pendentes}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Clientes com recompra em até 10 dias ou atrasada. Marcar a mensagem não remove o cliente de
          Atrasados/Sumidos — ele só sai quando comprar de novo.
        </p>
        <LembreteMensagens alertas={alertasAviso} isLoading={isLoading} />
      </section>

      {/* ── Produtos sem custo ─────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <h2 className="text-base font-semibold">Produtos sem custo cadastrado</h2>
          {!isLoadingSemCusto && (semCustoData?.length ?? 0) > 0 && (
            <span className="bg-orange-500 text-white text-[11px] font-bold rounded-full px-2 py-0.5">
              {semCustoData!.length}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Vendas dos últimos 90 dias com itens sem valor de custo — o lucro estimado pode estar incorreto.
          Cadastre o custo do produto e re-salve a venda.
        </p>

        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          {isLoadingSemCusto ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="px-4 py-3 space-y-1.5">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : (semCustoData?.length ?? 0) === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500/60" />
              <p className="text-sm text-muted-foreground">Todos os produtos têm custo cadastrado!</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {semCustoData!.map((v) => (
                <div key={v.vendaId} className="px-4 py-3 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        Venda V{String(v.vendaNumero).padStart(5, "0")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(v.vendaData)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Sem custo:{" "}
                      <span className="font-medium text-foreground">
                        {v.produtos.map((p) => p.produtoNome).join(", ")}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0 items-end">
                    {v.produtos.map((p) => (
                      <Link
                        key={p.produtoId}
                        href={`/produtos?q=${encodeURIComponent(p.produtoNome)}`}
                        className="text-xs text-primary underline underline-offset-2 hover:no-underline"
                      >
                        Cadastrar custo — {p.produtoNome}
                      </Link>
                    ))}
                    <Link
                      href={`/vendas/${v.vendaId}`}
                      className="text-xs text-muted-foreground underline underline-offset-2 hover:no-underline"
                    >
                      Ver venda
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Lembretes ──────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-primary" />
          <h2 className="text-base font-semibold">Lembretes</h2>
          {tarefas.length > 0 && (
            <span className="bg-primary text-primary-foreground text-[11px] font-bold rounded-full px-2 py-0.5">
              {tarefas.length}
            </span>
          )}
        </div>

        {/* Add task */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Descreva o lembrete..."
            value={novaTarefa}
            onChange={(e) => setNovaTarefa(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adicionarTarefa()}
            className="flex-1"
            disabled={createLembrete.isPending}
          />
          <Button
            onClick={adicionarTarefa}
            disabled={!novaTarefa.trim() || createLembrete.isPending}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>

        {/* Task list */}
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          {isLoadingTarefas ? (
            <div className="divide-y divide-border">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md shrink-0" />
                </div>
              ))}
            </div>
          ) : tarefas.length === 0 ? (
            <div className="p-8 text-center">
              <ClipboardList className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Nenhum lembrete. Adicione acima.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tarefas.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{t.texto}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(t.criadoEm)} · {t.criadoPor}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Marcar como concluído"
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 shrink-0"
                    onClick={() => setPendingTarefaId(t.id)}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={!!pendingTarefaId}
        onOpenChange={(o) => { if (!o) setPendingTarefaId(null); }}
        title="Concluir lembrete?"
        description={
          pendingTarefaId
            ? `"${tarefas.find((t) => t.id === pendingTarefaId)?.texto ?? ""}" será removido da lista.`
            : ""
        }
        confirmLabel="Sim, concluir"
        onConfirm={concluirTarefa}
      />
    </div>
  );
}
