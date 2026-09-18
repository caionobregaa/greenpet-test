import type {
  PrismaBiAvancadoRepository,
  ClienteLtv,
  TaxaRecompra,
  CicloRecompraCategoria,
  MargemCategoria,
  TaxaRecompraMensal,
  TaxaRecompraJanela,
  TaxaFechamentoMes,
  MotivoPerdaBreakdown,
} from '../../infrastructure/repositories/prisma-bi-avancado.repository.js'

const JANELAS_RECOMPRA_DIAS = [30, 60, 90] as const

export interface BiAvancado {
  rankingLtv: { clientes: ClienteLtv[]; total: number }
  taxaRecompra: TaxaRecompra
  taxaRecompraMensal: TaxaRecompraMensal[]
  taxaRecompraJanela: TaxaRecompraJanela[]
  cicloRecompraPorCategoria: CicloRecompraCategoria[]
  margemPorCategoria: MargemCategoria[]
  taxaFechamento: {
    porMes: TaxaFechamentoMes[]
    total: { fechados: number; perdidos: number; taxaFechamento: number; taxaNaoFechamento: number }
    breakdownMotivoPerda: MotivoPerdaBreakdown[]
  }
}

export class GetBiAvancadoUseCase {
  constructor(private readonly repo: PrismaBiAvancadoRepository) {}

  async execute(params: { inicio: Date; fim: Date; page?: number; limit?: number }): Promise<BiAvancado> {
    const [
      rankingLtv,
      taxaRecompra,
      cicloRecompraPorCategoria,
      margemPorCategoria,
      taxaRecompraMensal,
      taxaRecompraJanela,
      taxaFechamentoPorMes,
      breakdownMotivoPerda,
    ] = await Promise.all([
      this.repo.findRankingLtv({ page: params.page ?? 1, limit: params.limit ?? 20 }),
      this.repo.getTaxaRecompra(),
      this.repo.getCicloRecompraPorCategoria(),
      this.repo.getMargemPorCategoria(params.inicio, params.fim),
      this.repo.getTaxaRecompraMensal(params.inicio, params.fim),
      Promise.all(JANELAS_RECOMPRA_DIAS.map((dias) => this.repo.getTaxaRecompraJanela(params.inicio, params.fim, dias))),
      this.repo.getTaxaFechamentoMensal(params.inicio, params.fim),
      this.repo.getMotivoPerdaBreakdown(params.inicio, params.fim),
    ])

    const totalFechados = taxaFechamentoPorMes.reduce((s, m) => s + m.fechados, 0)
    const totalPerdidos = taxaFechamentoPorMes.reduce((s, m) => s + m.perdidos, 0)
    const totalConcluidos = totalFechados + totalPerdidos

    return {
      rankingLtv,
      taxaRecompra,
      taxaRecompraMensal,
      taxaRecompraJanela,
      cicloRecompraPorCategoria,
      margemPorCategoria,
      taxaFechamento: {
        porMes: taxaFechamentoPorMes,
        total: {
          fechados: totalFechados,
          perdidos: totalPerdidos,
          taxaFechamento: totalConcluidos > 0 ? Math.round((totalFechados / totalConcluidos) * 100 * 100) / 100 : 0,
          taxaNaoFechamento: totalConcluidos > 0 ? Math.round((totalPerdidos / totalConcluidos) * 100 * 100) / 100 : 0,
        },
        breakdownMotivoPerda,
      },
    }
  }
}
