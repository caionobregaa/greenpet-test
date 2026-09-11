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
import { ComprasPorFornecedorChart } from "@/components/dashboard/compras-por-fornecedor-chart";
import { VendasPorFormaPagamentoChart } from "@/components/dashboard/vendas-por-forma-pagamento-chart";
import { DespesasPorCategoriaChart } from "@/components/dashboard/despesas-por-categoria-chart";
import { CurvaResumoCard } from "@/components/bi/curva-resumo-card";
import { RankingLtvCard } from "@/components/bi/ranking-ltv-card";
import { CicloRecompraCard } from "@/components/bi/ciclo-recompra-card";
import { MargemCategoriaCard } from "@/components/bi/margem-categoria-card";
import { useBiAvancado } from "@/lib/hooks/use-bi-avancado";
import { formatBRL, todayISO } from "@/lib/utils/format";
import type { ComparativoItem } from "@/lib/types/dashboard";

const MASK = "R$ ••••••";
const MASK_COUNT = "••";

function firstDayOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

function formatVariacao(item: ComparativoItem | undefined, visivel: boolean): string {
  if (!visivel) return "•• vs período anterior";
  if (!item || item.variacaoPercentual === null) return "sem dado no período anterior";
  const sinal = item.variacaoPercentual > 0 ? "▲" : item.variacaoPercentual < 0 ? "▼" : "—";
  const valor = Math.abs(item.variacaoPercentual).toFixed(1);
  return `${sinal} ${valor}% vs período anterior`;
}

export default function BiPage() {
  const [inicio, setInicio] = useState(firstDayOfMonth());
  const [fim, setFim] = useState(todayISO());
  const [valoresVisiveis, setValoresVisiveis] = useState(false);
  const { data, isLoading } = useDashboard(inicio, fim);
  const { data: avancado, isLoading: isLoadingAvancado } = useBiAvancado(inicio, fim);

  const v = (brl: number) => valoresVisiveis ? formatBRL(brl) : MASK;
  const n = (num: number) => valoresVisiveis ? String(num) : MASK_COUNT;
  const comp = data?.comparativoPeriodoAnterior;

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">BI</h1>
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
            sub={formatVariacao(comp?.totalReceita, valoresVisiveis)}
          />
          <KpiCard
            label="Lucro Bruto"
            value={v(data?.totalLucroLiquido ?? 0)}
            sub="receita − custo dos produtos"
          />
          <KpiCard
            label="Lucro Líquido Real"
            value={v(data?.totalLucroLiquidoReal ?? 0)}
            sub={
              valoresVisiveis
                ? `lucro bruto − ${formatBRL(data?.totalTaxasCartao ?? 0)} de taxa de cartão`
                : formatVariacao(comp?.totalLucroLiquidoReal, valoresVisiveis)
            }
          />
          <KpiCard
            label="Ticket Médio"
            value={v(data?.ticketMedio ?? 0)}
            sub={formatVariacao(comp?.ticketMedio, valoresVisiveis)}
          />
          <KpiCard
            label="Custo de Aquisição"
            value={v(data?.totalCustoAquisicao ?? 0)}
            sub={formatVariacao(comp?.totalCustoAquisicao, valoresVisiveis)}
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

      {/* Vendas por forma de pagamento + Despesas por categoria + Curva ABC */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </>
        ) : (
          <>
            <div className={valoresVisiveis ? "" : "blur-sm select-none pointer-events-none"}>
              <VendasPorFormaPagamentoChart formasPagamento={data?.vendasPorFormaPagamento ?? []} />
            </div>
            <div className={valoresVisiveis ? "" : "blur-sm select-none pointer-events-none"}>
              <DespesasPorCategoriaChart categorias={data?.despesasPorCategoria ?? []} />
            </div>
            <CurvaResumoCard resumo={data?.curvaResumo ?? { A: 0, B: 0, C: 0 }} />
          </>
        )}
      </div>

      {/* Top Clientes + Top Produtos + Compras por Distribuidora */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <Skeleton className="h-64 rounded-xl" />
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
            <div className={valoresVisiveis ? "" : "blur-sm select-none pointer-events-none"}>
              <ComprasPorFornecedorChart fornecedores={data?.comprasPorFornecedor ?? []} />
            </div>
          </>
        )}
      </div>

      {/* Métricas avançadas: LTV, taxa de recompra, ciclo por categoria, margem por categoria */}
      <div className="pt-2 border-t border-border/60">
        <h2 className="text-xs font-bold uppercase tracking-[0.07em] text-muted-foreground mb-4">Métricas Avançadas</h2>

        {isLoadingAvancado ? (
          <Skeleton className="h-24 rounded-xl mb-4" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <KpiCard
              label="Taxa Real de Recompra"
              value={valoresVisiveis ? `${avancado?.taxaRecompra.percentual.toFixed(1) ?? 0}%` : MASK_COUNT}
              sub={
                valoresVisiveis
                  ? `${avancado?.taxaRecompra.clientesComRecompra ?? 0} de ${avancado?.taxaRecompra.totalClientes ?? 0} clientes voltaram`
                  : "clientes que recompraram"
              }
            />
          </div>
        )}

        {isLoadingAvancado ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        ) : (
          <div className={valoresVisiveis ? "" : "blur-sm select-none pointer-events-none"}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <RankingLtvCard clientes={avancado?.rankingLtv.clientes ?? []} total={avancado?.rankingLtv.total ?? 0} />
              <CicloRecompraCard ciclos={avancado?.cicloRecompraPorCategoria ?? []} />
            </div>
            <MargemCategoriaCard categorias={avancado?.margemPorCategoria ?? []} />
          </div>
        )}
      </div>
    </div>
  );
}
