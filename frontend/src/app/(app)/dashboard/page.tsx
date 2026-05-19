"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { TopClientesCard } from "@/components/dashboard/top-clientes-card";
import { TopProdutosCard } from "@/components/dashboard/top-produtos-card";
import { ReceitaPorMesChart } from "@/components/dashboard/receita-por-mes-chart";
import { formatBRL, todayISO } from "@/lib/utils/format";

function firstDayOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const [inicio, setInicio] = useState(firstDayOfMonth());
  const [fim, setFim] = useState(todayISO());
  const { data, isLoading } = useDashboard(inicio, fim);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <PeriodFilter
          inicio={inicio}
          fim={fim}
          onInicioChange={setInicio}
          onFimChange={setFim}
        />
      </div>

      {/* KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            label="Faturamento"
            value={formatBRL(data?.totalReceita ?? 0)}
            sub="no período"
          />
          <KpiCard
            label="Total de Vendas"
            value={String(data?.totalVendas ?? 0)}
            sub="transações"
          />
          <KpiCard
            label="Ticket Médio"
            value={formatBRL(data?.ticketMedio ?? 0)}
            sub="por venda"
          />
          <KpiCard
            label="Top Cliente"
            value={data?.topClientes?.[0]?.nome ?? "—"}
            sub={
              data?.topClientes?.[0]
                ? formatBRL(data.topClientes[0].totalGasto)
                : undefined
            }
          />
        </div>
      )}

      {/* Charts + Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {isLoading ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : (
            <ReceitaPorMesChart data={data?.receitaPorMes ?? []} />
          )}
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </>
          ) : (
            <>
              <TopClientesCard clientes={data?.topClientes ?? []} />
              <TopProdutosCard produtos={data?.topProdutos ?? []} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
