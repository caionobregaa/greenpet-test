"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Plus,
  ClipboardList,
  BellRing,
} from "lucide-react";
import { useRecompra, useDismissRecompra } from "@/lib/hooks/use-recompra";
import { DismissRecompraDialog } from "@/components/shared/dismiss-recompra-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UrgencyPill } from "@/components/shared/urgency-pill";
import { formatDate, formatDiasRestantes } from "@/lib/utils/format";
import type { RecompraAlerta } from "@/lib/types/recompra";
import { Skeleton } from "@/components/ui/skeleton";

// ── Lembretes (localStorage) ──────────────────────────────────────────────────

interface Tarefa {
  id: string;
  texto: string;
  criadoEm: string;
}

const TAREFAS_KEY = "avisos-tarefas";

function loadTarefas(): Tarefa[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(TAREFAS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function persistTarefas(lista: Tarefa[]) {
  localStorage.setItem(TAREFAS_KEY, JSON.stringify(lista));
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function AvisosPage() {
  const { data: recompraData, isLoading } = useRecompra({ limit: 100 });
  const dismiss = useDismissRecompra();

  const [pendingAlerta, setPendingAlerta] = useState<RecompraAlerta | null>(null);

  // Apenas alertas com situação abaixo de 10 dias (vencido, urgente, próximo + até 10 dias)
  const alertasUrgentes = (recompraData?.data ?? []).filter(
    (a) => a.diasRestantes <= 10
  );

  // ── Tarefas ──
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [novaTarefa, setNovaTarefa] = useState("");

  useEffect(() => {
    setTarefas(loadTarefas());
  }, []);

  function salvarTarefas(lista: Tarefa[]) {
    setTarefas(lista);
    persistTarefas(lista);
  }

  function adicionarTarefa() {
    const texto = novaTarefa.trim();
    if (!texto) return;
    const nova: Tarefa = {
      id: crypto.randomUUID(),
      texto,
      criadoEm: new Date().toISOString(),
    };
    salvarTarefas([...tarefas, nova]);
    setNovaTarefa("");
  }

  function concluirTarefa(id: string) {
    salvarTarefas(tarefas.filter((t) => t.id !== id));
    toast.success("Tarefa concluída!");
  }

  async function confirmarDismiss() {
    if (!pendingAlerta) return;
    try {
      await dismiss.mutateAsync({
        produtoId: pendingAlerta.produtoId,
        clienteId: pendingAlerta.clienteId,
        animalId: pendingAlerta.animalId,
        reason: "ok",
      });
      toast.success("Alerta marcado como resolvido!");
    } catch {
      toast.error("Erro ao atualizar o alerta.");
    } finally {
      setPendingAlerta(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* ── Recompra urgentes ──────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BellRing className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-semibold">Alertas de Recompra</h2>
          {!isLoading && alertasUrgentes.length > 0 && (
            <span className="bg-red-500 text-white text-[11px] font-bold rounded-full px-2 py-0.5">
              {alertasUrgentes.length}
            </span>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden bg-card rounded-xl border border-border overflow-hidden shadow-sm divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))
          ) : alertasUrgentes.length === 0 ? (
            <div className="p-8 text-center">
              <BellRing className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Nenhum alerta urgente. Tudo no prazo!
              </p>
            </div>
          ) : (
            alertasUrgentes.map((a) => (
              <div key={`${a.produtoId}-${a.clienteId}-${a.animalId}`} className="p-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{a.produtoNome}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.clienteNome} · {a.animalNome}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <UrgencyPill urgencia={a.urgencia} />
                    <span className="text-xs text-muted-foreground">
                      {formatDiasRestantes(a.diasRestantes)}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  title="Marcar como resolvido"
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 shrink-0"
                  onClick={() => setPendingAlerta(a)}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Cliente
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Animal
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Produto
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Previsão
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Situação
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Urgência
                  </th>
                  <th className="px-4 py-3 w-16 text-center font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    OK
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-t border-border">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : alertasUrgentes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center">
                      <BellRing className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">
                        Nenhum alerta urgente. Tudo no prazo!
                      </p>
                    </td>
                  </tr>
                ) : (
                  alertasUrgentes.map((a) => (
                    <tr
                      key={`${a.produtoId}-${a.clienteId}-${a.animalId}`}
                      className="border-t border-border hover:bg-accent/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{a.clienteNome}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.animalNome}</td>
                      <td className="px-4 py-3">{a.produtoNome}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(a.previsaoRecompra)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {formatDiasRestantes(a.diasRestantes)}
                      </td>
                      <td className="px-4 py-3">
                        <UrgencyPill urgencia={a.urgencia} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Marcar como resolvido"
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => setPendingAlerta(a)}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
          />
          <Button
            onClick={adicionarTarefa}
            disabled={!novaTarefa.trim()}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>

        {/* Task list */}
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          {tarefas.length === 0 ? (
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
                      {formatDate(t.criadoEm)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Marcar como concluído"
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 shrink-0"
                    onClick={() => concluirTarefa(t.id)}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <DismissRecompraDialog
        alerta={pendingAlerta}
        reason="ok"
        loading={dismiss.isPending}
        onClose={() => setPendingAlerta(null)}
        onConfirm={confirmarDismiss}
      />
    </div>
  );
}
