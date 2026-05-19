"use client";

import { useState } from "react";
import { useRecompra } from "@/lib/hooks/use-recompra";
import { Skeleton } from "@/components/ui/skeleton";
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
import type { Urgencia } from "@/lib/types/recompra";
import { Label } from "@/components/ui/label";

export default function RecompraPage() {
  const [urgencia, setUrgencia] = useState<Urgencia | undefined>();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useRecompra({ urgencia, page, limit: 20 });

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
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />Urgente: faltam ≤ 7 dias</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />Próximo: faltam ≤ 30 dias</div>
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
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.data.length === 0 ? (
                <tr><td colSpan={7}><EmptyState message="Nenhum alerta encontrado" description="Todos os produtos estão no prazo ou sem histórico suficiente." /></td></tr>
              ) : (
                data?.data.map((a, i) => (
                  <tr key={i} className="border-t border-border hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{a.clienteNome}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{a.animalNome}</td>
                    <td className="px-4 py-3">{a.produtoNome}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{formatDate(a.ultimaCompra)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{formatDate(a.previsaoRecompra)}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {formatDiasRestantes(a.diasRestantes)}
                    </td>
                    <td className="px-4 py-3">
                      <UrgencyPill urgencia={a.urgencia} />
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
    </div>
  );
}
