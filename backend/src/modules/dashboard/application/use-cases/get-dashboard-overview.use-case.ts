import type { PrismaDashboardRepository, DashboardKPIs } from '../../infrastructure/repositories/prisma-dashboard.repository.js'
import type { GetCurvaVendaUseCase } from '@/modules/curva-venda/application/use-cases/get-curva-venda.use-case.js'
import { previousPeriodRange, calcVariacaoPercentual } from '../../domain/services/period-comparison.service.js'

export interface ComparativoItem {
  atual: number
  anterior: number
  variacaoPercentual: number | null
}

export interface DashboardOverview extends DashboardKPIs {
  curvaResumo: { A: number; B: number; C: number }
  comparativoPeriodoAnterior: {
    totalReceita: ComparativoItem
    totalLucroLiquidoReal: ComparativoItem
    totalVendas: ComparativoItem
    ticketMedio: ComparativoItem
    totalCustoAquisicao: ComparativoItem
  }
}

export class GetDashboardOverviewUseCase {
  constructor(
    private readonly dashboardRepo: PrismaDashboardRepository,
    private readonly curvaVendaUseCase: GetCurvaVendaUseCase,
  ) {}

  async execute(params: { inicio: Date; fim: Date }): Promise<DashboardOverview> {
    const { inicio, fim } = params
    const anterior = previousPeriodRange(inicio, fim)

    const [kpis, metricasAnteriores, curva] = await Promise.all([
      this.dashboardRepo.getKPIs({ inicio, fim }),
      this.dashboardRepo.getScalarMetrics(anterior),
      this.curvaVendaUseCase.execute({ dataInicio: inicio, dataFim: fim, limit: 1 }),
    ])

    function comparar(atual: number, valorAnterior: number): ComparativoItem {
      return { atual, anterior: valorAnterior, variacaoPercentual: calcVariacaoPercentual(atual, valorAnterior) }
    }

    return {
      ...kpis,
      curvaResumo: curva.resumo,
      comparativoPeriodoAnterior: {
        totalReceita: comparar(kpis.totalReceita, metricasAnteriores.totalReceita),
        totalLucroLiquidoReal: comparar(kpis.totalLucroLiquidoReal, metricasAnteriores.totalLucroLiquidoReal),
        totalVendas: comparar(kpis.totalVendas, metricasAnteriores.totalVendas),
        ticketMedio: comparar(kpis.ticketMedio, metricasAnteriores.ticketMedio),
        totalCustoAquisicao: comparar(kpis.totalCustoAquisicao, metricasAnteriores.totalCustoAquisicao),
      },
    }
  }
}
