"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { ReceitaPorMesChart } from "@/components/dashboard/receita-por-mes-chart";
import { TopClientesChart } from "@/components/dashboard/top-clientes-chart";
import { TopProdutosChart } from "@/components/dashboard/top-produtos-chart";
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
      {/* Header + Filters */}
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
            label="Líquido (após taxas)"
            value={formatBRL(data?.totalLucroLiquido ?? 0)}
            sub="receita após cartão"
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
        </div>
      )}

      {/* Receita & Vendas por Mês — full width */}
      {isLoading ? (
        <Skeleton className="h-72 rounded-xl" />
      ) : (
        <ReceitaPorMesChart data={data?.receitaPorMes ?? []} />
      )}

      {/* Top Clientes + Top Produtos — side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </>
        ) : (
          <>
            <TopClientesChart clientes={data?.topClientes ?? []} />
            <TopProdutosChart produtos={data?.topProdutos ?? []} />
          </>
        )}
      </div>
    </div>
  );
}
