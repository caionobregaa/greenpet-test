"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useRecompra, useDismissRecompra } from "@/lib/hooks/use-recompra";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { UrgencyPill } from "@/components/shared/urgency-pill";
import { formatDate, formatDiasRestantes } from "@/lib/utils/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Urgencia, RecompraAlerta } from "@/lib/types/recompra";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// ── Dialog de confirmação de dismiss ─────────────────────────────────────────

interface DismissDialogProps {
  alerta: RecompraAlerta | null;
  reason: "ok" | "cancelado" | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

function DismissDialog({ alerta, reason, onClose, onConfirm, loading }: DismissDialogProps) {
  if (!alerta || !reason) return null;

  const isOk = reason === "ok";

  return (
    <AlertDialog open={!!alerta} onOpenChange={(o) => { if (!o) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isOk
              ? <CheckCircle2 className="w-5 h-5 text-green-600" />
              : <XCircle className="w-5 h-5 text-destructive" />
            }
            {isOk ? "Confirmar como Resolvido?" : "Confirmar Cancelamento?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 pt-1">
            <span className="block">
              {isOk
                ? "Você está marcando que já cuidou desta recompra. O alerta vai sumir da lista."
                : "Você está cancelando este alerta. Ele será removido da lista."
              }
            </span>
            <span className="block mt-2 rounded-md bg-muted/40 border border-border px-3 py-2 text-sm text-foreground">
              <span className="font-semibold">{alerta.produtoNome}</span>
              <br />
              <span className="text-muted-foreground">
                {alerta.clienteNome} · {alerta.animalNome}
              </span>
            </span>
            <span className="block text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 inline" />
              O alerta reaparecerá automaticamente se uma nova compra for registrada.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={loading}>
            Voltar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); onConfirm(); }}
            disabled={loading}
            className={isOk
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-destructive text-white hover:bg-destructive/90"
            }
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Processando...</>
              : isOk ? "Sim, marcar como OK" : "Sim, cancelar alerta"
            }
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function RecompraPage() {
  const [urgencia, setUrgencia] = useState<Urgencia | undefined>();
  const [page, setPage] = useState(1);

  const [pendingAlerta, setPendingAlerta] = useState<RecompraAlerta | null>(null);
  const [pendingReason, setPendingReason] = useState<"ok" | "cancelado" | null>(null);

  const { data, isLoading } = useRecompra({ urgencia, page, limit: 20 });
  const dismiss = useDismissRecompra();

  function handleAction(alerta: RecompraAlerta, reason: "ok" | "cancelado") {
    setPendingAlerta(alerta);
    setPendingReason(reason);
  }

  async function handleConfirm() {
    if (!pendingAlerta || !pendingReason) return;
    try {
      await dismiss.mutateAsync({
        produtoId: pendingAlerta.produtoId,
        clienteId: pendingAlerta.clienteId,
        animalId: pendingAlerta.animalId,
        reason: pendingReason,
      });
      toast.success(
        pendingReason === "ok"
          ? "Alerta marcado como resolvido!"
          : "Alerta cancelado com sucesso!"
      );
    } catch {
      toast.error("Erro ao atualizar o alerta.");
    } finally {
      setPendingAlerta(null);
      setPendingReason(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Controle Recompra</h1>
          <p className="text-sm text-muted-foreground">Alertas de reposição de estoque</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-end gap-4 mb-4">
        <div className="space-y-1">
          <Label className="text-xs">Urgência</Label>
          <Select
            value={urgencia ?? "todos"}
            onValueChange={(v) => {
              setUrgencia(v === "todos" ? undefined : (v as Urgencia));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="vencido">Vencido</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
              <SelectItem value="proximo">Próximo</SelectItem>
              <SelectItem value="ok">OK</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />Vencido: passou a data prevista</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />Urgente: faltam ≤ 3 dias</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />Próximo: faltam ≤ 7 dias</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-600 inline-block" />OK: no prazo</div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Cliente</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Animal</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Produto</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Última Compra</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Previsão</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Situação</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Urgência</th>
                <th className="px-4 py-3 w-28 text-center font-semibold text-muted-foreground text-xs uppercase tracking-wide">Ação</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState message="Nenhum alerta encontrado" description="Todos os produtos estão no prazo ou sem histórico suficiente." />
                  </td>
                </tr>
              ) : (
                data?.data.map((a, i) => (
                  <tr key={i} className="border-t border-border hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{a.clienteNome}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{a.animalNome}</td>
                    <td className="px-4 py-3">{a.produtoNome}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{formatDate(a.ultimaCompra)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{formatDate(a.previsaoRecompra)}</td>
                    <td className="px-4 py-3 text-sm font-medium">{formatDiasRestantes(a.diasRestantes)}</td>
                    <td className="px-4 py-3"><UrgencyPill urgencia={a.urgencia} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Marcar como resolvido"
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleAction(a, "ok")}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Cancelar alerta"
                          className="h-8 w-8 p-0 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleAction(a, "cancelado")}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data?.meta && (
          <div className="px-4 pb-4">
            <PaginationBar meta={data.meta} onPageChange={setPage} />
          </div>
        )}
      </div>

      <DismissDialog
        alerta={pendingAlerta}
        reason={pendingReason}
        onClose={() => { setPendingAlerta(null); setPendingReason(null); }}
        onConfirm={handleConfirm}
        loading={dismiss.isPending}
      />
    </div>
  );
}
