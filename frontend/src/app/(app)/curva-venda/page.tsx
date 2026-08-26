"use client";

import { useState } from "react";
import { X, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { useCurvaVenda } from "@/lib/hooks/use-curva-venda";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { CurvaPill } from "@/components/curva-venda/curva-pill";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { formatBRL } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { CurvaVendaSortField, SortOrder } from "@/lib/types/curva-venda";

const CATEGORIAS = ["Ração", "Petisco", "Suplemento", "Medicamento", "Acessório", "Higiene", "Serviço"];

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 pl-3 pr-8 rounded-md border border-input bg-background text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
      >
        <option value="">{label}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

interface SortableThProps {
  label: string;
  field: CurvaVendaSortField;
  sortBy: CurvaVendaSortField | undefined;
  sortOrder: SortOrder;
  onSort: (field: CurvaVendaSortField) => void;
  align?: "left" | "right";
  className?: string;
}

function SortableTh({ label, field, sortBy, sortOrder, onSort, align = "left", className }: SortableThProps) {
  const active = sortBy === field;
  const Icon = !active ? ArrowUpDown : sortOrder === "asc" ? ArrowUp : ArrowDown;

  return (
    <th
      className={cn(
        "px-4 py-3 font-semibold text-xs uppercase tracking-wide",
        align === "right" ? "text-right" : "text-left",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onSort(field)}
        title={`Ordenar por ${label}`}
        aria-label={`Ordenar por ${label}`}
        className={cn(
          "inline-flex items-center gap-1 hover:text-foreground transition-colors",
          align === "right" && "flex-row-reverse",
          active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        <Icon className="w-3 h-3" />
      </button>
    </th>
  );
}

export default function CurvaVendaPage() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [categoria, setCategoria] = useState("");
  const [sortBy, setSortBy] = useState<CurvaVendaSortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [page, setPage] = useState(1);

  const hasFilters = !!(dataInicio || dataFim || categoria);

  function resetFilters() {
    setDataInicio("");
    setDataFim("");
    setCategoria("");
    setPage(1);
  }

  function handleSort(field: CurvaVendaSortField) {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  }

  const { data, isLoading, isError } = useCurvaVenda({
    dataInicio: dataInicio ? new Date(dataInicio).toISOString() : undefined,
    dataFim: dataFim ? new Date(dataFim).toISOString() : undefined,
    categoria: categoria || undefined,
    sortBy,
    sortOrder,
    page,
    limit: 20,
  });

  const resumo = data?.meta.resumo;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Curva de Venda</h1>
          <p className="text-sm text-muted-foreground">Classificação ABC dos produtos por receita</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total de Produtos" value={String(data?.meta.total ?? 0)} />
        <KpiCard label="Curva A" value={String(resumo?.A ?? 0)} sub="≤ 80% da receita acumulada" />
        <KpiCard label="Curva B" value={String(resumo?.B ?? 0)} sub="80% – 95% da receita acumulada" />
        <KpiCard label="Curva C" value={String(resumo?.C ?? 0)} sub="> 95% da receita acumulada" />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Categoria"
            value={categoria}
            onChange={(v) => { setCategoria(v); setPage(1); }}
            options={CATEGORIAS}
          />
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground gap-1">
              <X className="w-3.5 h-3.5" />
              Limpar filtros
            </Button>
          )}
        </div>
        <PeriodFilter
          inicio={dataInicio}
          fim={dataFim}
          onInicioChange={(v) => { setDataInicio(v); setPage(1); }}
          onFimChange={(v) => { setDataFim(v); setPage(1); }}
        />
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-600 inline-block" />A: até 80% da receita acumulada</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />B: de 80% a 95% da receita acumulada</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/60 inline-block" />C: acima de 95% da receita acumulada</div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Produto</th>
                <SortableTh
                  label="Categoria"
                  field="categoria"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  className="hidden md:table-cell"
                />
                <SortableTh
                  label="Qtd. Vendida"
                  field="quantidadeVendida"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  align="right"
                  className="hidden lg:table-cell"
                />
                <SortableTh
                  label="Receita Total"
                  field="receitaTotal"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  align="right"
                />
                <SortableTh
                  label="% Receita"
                  field="percentualReceita"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  align="right"
                  className="hidden lg:table-cell"
                />
                <SortableTh
                  label="% Acumulado"
                  field="percentualAcumulado"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  align="right"
                  className="hidden lg:table-cell"
                />
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Curva</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState message="Erro ao carregar a curva de venda" description="Tente novamente em instantes." />
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState message="Nenhum produto encontrado" description="Sem vendas registradas no período/categoria selecionados." />
                  </td>
                </tr>
              ) : (
                data?.data.map((item) => (
                  <tr key={item.produtoId} className="border-t border-border hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{item.produtoNome}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{item.categoria}</td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">{item.quantidadeVendida}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatBRL(item.receitaTotal)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden lg:table-cell">{formatPercent(item.percentualReceita)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground hidden lg:table-cell">{formatPercent(item.percentualAcumulado)}</td>
                    <td className="px-4 py-3"><CurvaPill curva={item.curva} /></td>
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
