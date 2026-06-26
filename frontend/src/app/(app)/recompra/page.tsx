"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRecompra, useDismissRecompra, useCreateRecompraManual, useDeleteRecompraManual } from "@/lib/hooks/use-recompra";
import { useClientes } from "@/lib/hooks/use-clientes";
import { useAnimais } from "@/lib/hooks/use-animais";
import { useProdutos } from "@/lib/hooks/use-produtos";
import { DismissRecompraDialog } from "@/components/shared/dismiss-recompra-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Urgencia, RecompraAlerta } from "@/lib/types/recompra";
import { Loader2, CheckCircle2, XCircle, Plus, Trash2 } from "lucide-react";

// ── Diálogo de Recompra Manual ─────────────────────────────────────────────

function NovaRecompraManualDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [clienteSearch, setClienteSearch] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [animalId, setAnimalId] = useState("");
  const [produtoSearch, setProdutoSearch] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [ultimaCompra, setUltimaCompra] = useState("");
  const [modoPrevisao, setModoPrevisao] = useState<"data" | "dias">("dias");
  const [previsaoData, setPrevisaoData] = useState("");
  const [diasRecompra, setDiasRecompra] = useState("");

  const { data: clientes } = useClientes({ q: clienteSearch, limit: 20 });
  const { data: animais } = useAnimais({ clienteId: clienteId || undefined, limit: 50 });
  const { data: produtos } = useProdutos({ q: produtoSearch, limit: 20 });

  const criar = useCreateRecompraManual();

  function reset() {
    setClienteSearch("");
    setClienteId("");
    setAnimalId("");
    setProdutoSearch("");
    setProdutoId("");
    setUltimaCompra("");
    setModoPrevisao("dias");
    setPrevisaoData("");
    setDiasRecompra("");
  }

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clienteId) return toast.error("Selecione um cliente.");
    if (!produtoId) return toast.error("Selecione um produto.");
    if (modoPrevisao === "data" && !previsaoData) return toast.error("Informe a data de previsão.");
    if (modoPrevisao === "dias" && !diasRecompra) return toast.error("Informe o número de dias.");

    try {
      await criar.mutateAsync({
        clienteId,
        animalId: animalId || undefined,
        produtoId,
        ultimaCompra: ultimaCompra ? new Date(ultimaCompra).toISOString() : null,
        previsaoData: modoPrevisao === "data" && previsaoData ? new Date(previsaoData).toISOString() : null,
        diasRecompra: modoPrevisao === "dias" && diasRecompra ? Number(diasRecompra) : null,
      });
      toast.success("Recompra manual adicionada!");
      handleClose();
    } catch {
      toast.error("Erro ao salvar recompra manual.");
    }
  }

  const clienteSelecionado = clientes?.data.find((c) => c.id === clienteId);
  const produtoSelecionado = produtos?.data.find((p) => p.id === produtoId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Recompra Manual</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Cliente */}
          <div className="space-y-1.5">
            <Label>Cliente <span className="text-destructive">*</span></Label>
            {clienteSelecionado ? (
              <div className="flex items-center justify-between border rounded-md px-3 py-2 text-sm bg-muted/40">
                <span>{clienteSelecionado.nome}</span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => { setClienteId(""); setAnimalId(""); }}
                >
                  Trocar
                </button>
              </div>
            ) : (
              <>
                <Input
                  placeholder="Buscar cliente..."
                  value={clienteSearch}
                  onChange={(e) => setClienteSearch(e.target.value)}
                />
                {clienteSearch && clientes?.data && clientes.data.length > 0 && (
                  <div className="border rounded-md shadow-sm max-h-40 overflow-y-auto bg-popover text-sm">
                    {clientes.data.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
                        onClick={() => { setClienteId(c.id); setClienteSearch(""); setAnimalId(""); }}
                      >
                        {c.nome}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Animal (opcional, filtered by clienteId) */}
          {clienteId && (
            <div className="space-y-1.5">
              <Label>Animal (opcional)</Label>
              <Select value={animalId || "_none"} onValueChange={(v) => setAnimalId(v == null || v === "_none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o animal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Nenhum</SelectItem>
                  {animais?.data.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Produto */}
          <div className="space-y-1.5">
            <Label>Produto <span className="text-destructive">*</span></Label>
            {produtoSelecionado ? (
              <div className="flex items-center justify-between border rounded-md px-3 py-2 text-sm bg-muted/40">
                <span>{produtoSelecionado.nome}</span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setProdutoId("")}
                >
                  Trocar
                </button>
              </div>
            ) : (
              <>
                <Input
                  placeholder="Buscar produto..."
                  value={produtoSearch}
                  onChange={(e) => setProdutoSearch(e.target.value)}
                />
                {produtoSearch && produtos?.data && produtos.data.length > 0 && (
                  <div className="border rounded-md shadow-sm max-h-40 overflow-y-auto bg-popover text-sm">
                    {produtos.data.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-accent transition-colors"
                        onClick={() => { setProdutoId(p.id); setProdutoSearch(""); }}
                      >
                        {p.nome}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Última Compra (opcional) */}
          <div className="space-y-1.5">
            <Label>Última Compra (opcional)</Label>
            <Input
              type="date"
              value={ultimaCompra}
              onChange={(e) => setUltimaCompra(e.target.value)}
            />
          </div>

          {/* Previsão: data ou dias */}
          <div className="space-y-1.5">
            <Label>Previsão de Recompra <span className="text-destructive">*</span></Label>
            <div className="flex gap-3 mb-2">
              <button
                type="button"
                className={`flex-1 py-1.5 text-sm rounded-md border transition-colors ${
                  modoPrevisao === "dias"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:bg-accent"
                }`}
                onClick={() => setModoPrevisao("dias")}
              >
                Número de Dias
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 text-sm rounded-md border transition-colors ${
                  modoPrevisao === "data"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background border-border text-muted-foreground hover:bg-accent"
                }`}
                onClick={() => setModoPrevisao("data")}
              >
                Data Específica
              </button>
            </div>
            {modoPrevisao === "dias" ? (
              <Input
                type="number"
                min={1}
                placeholder="Ex: 30"
                value={diasRecompra}
                onChange={(e) => setDiasRecompra(e.target.value)}
              />
            ) : (
              <Input
                type="date"
                value={previsaoData}
                onChange={(e) => setPrevisaoData(e.target.value)}
              />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={criar.isPending}>
              {criar.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function RecompraPage() {
  const [urgencia, setUrgencia] = useState<Urgencia | undefined>();
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [pendingAlerta, setPendingAlerta] = useState<RecompraAlerta | null>(null);
  const [pendingReason, setPendingReason] = useState<"ok" | "cancelado" | null>(null);

  const { data, isLoading } = useRecompra({ urgencia, page, limit: 20 });
  const dismiss = useDismissRecompra();
  const deleteManual = useDeleteRecompraManual();

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

  async function handleDeleteManual(id: string) {
    try {
      await deleteManual.mutateAsync(id);
      toast.success("Recompra manual removida.");
    } catch {
      toast.error("Erro ao remover recompra manual.");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Controle Recompra</h1>
          <p className="text-sm text-muted-foreground">Alertas de reposição de estoque</p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Recompra Manual
        </Button>
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
                    <td className="px-4 py-3 font-medium">
                      {a.clienteNome}
                      {a.isManual && (
                        <span className="ml-1.5 text-[10px] text-muted-foreground border border-border rounded px-1 py-0.5">manual</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{a.animalNome}</td>
                    <td className="px-4 py-3">{a.produtoNome}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{formatDate(a.ultimaCompra)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{formatDate(a.previsaoRecompra)}</td>
                    <td className="px-4 py-3 text-sm font-medium">{formatDiasRestantes(a.diasRestantes)}</td>
                    <td className="px-4 py-3"><UrgencyPill urgencia={a.urgencia} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {a.isManual && a.id ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Remover recompra manual"
                            className="h-8 w-8 p-0 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteManual(a.id!)}
                            disabled={deleteManual.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        ) : (
                          <>
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
                          </>
                        )}
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

      <DismissRecompraDialog
        alerta={pendingAlerta}
        reason={pendingReason}
        onClose={() => { setPendingAlerta(null); setPendingReason(null); }}
        onConfirm={handleConfirm}
        loading={dismiss.isPending}
      />

      <NovaRecompraManualDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
