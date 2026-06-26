"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/lib/hooks/use-dashboard";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { PeriodFilter } from "@/components/dashboard/period-filter";
import { ReceitaPorMesChart } from "@/components/dashboard/receita-por-mes-chart";
import { TopClientesChart } from "@/components/dashboard/top-clientes-chart";
import { TopProdutosChart } from "@/components/dashboard/top-produtos-chart";
import { formatBRL, todayISO } from "@/lib/utils/format";

const MASK = "R$ ••••••";
const MASK_COUNT = "••";

function firstDayOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

export default function DashboardPage() {
  const [inicio, setInicio] = useState(firstDayOfMonth());
  const [fim, setFim] = useState(todayISO());
  const [valoresVisiveis, setValoresVisiveis] = useState(false);
  const { data, isLoading } = useDashboard(inicio, fim);

  const v = (brl: number) => valoresVisiveis ? formatBRL(brl) : MASK;
  const n = (num: number) => valoresVisiveis ? String(num) : MASK_COUNT;

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title={valoresVisiveis ? "Ocultar valores" : "Revelar valores"}
            onClick={() => setValoresVisiveis((prev) => !prev)}
          >
            {valoresVisiveis ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        </div>
        <PeriodFilter
          inicio={inicio}
          fim={fim}
          onInicioChange={setInicio}
          onFimChange={setFim}
        />
      </div>

      {/* KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <KpiCard
            label="Faturamento"
            value={v(data?.totalReceita ?? 0)}
            sub="no período"
          />
          <KpiCard
            label="Líquido (após taxas)"
            value={v(data?.totalLucroLiquido ?? 0)}
            sub="receita após cartão"
          />
          <KpiCard
            label="Total de Vendas"
            value={n(data?.totalVendas ?? 0)}
            sub="transações"
          />
          <KpiCard
            label="Ticket Médio"
            value={v(data?.ticketMedio ?? 0)}
            sub="por venda"
          />
          <KpiCard
            label="Custo de Aquisição"
            value={v(data?.totalCustoAquisicao ?? 0)}
            sub="despesas no período"
          />
        </div>
      )}

      {/* Receita & Vendas por Mês — full width */}
      {isLoading ? (
        <Skeleton className="h-72 rounded-xl" />
      ) : (
        <div className={valoresVisiveis ? "" : "blur-sm select-none pointer-events-none"}>
          <ReceitaPorMesChart data={data?.receitaPorMes ?? []} />
        </div>
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
            <div className={valoresVisiveis ? "" : "blur-sm select-none pointer-events-none"}>
              <TopClientesChart clientes={data?.topClientes ?? []} />
            </div>
            <div className={valoresVisiveis ? "" : "blur-sm select-none pointer-events-none"}>
              <TopProdutosChart produtos={data?.topProdutos ?? []} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
