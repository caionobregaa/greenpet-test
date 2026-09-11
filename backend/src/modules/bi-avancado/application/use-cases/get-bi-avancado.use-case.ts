import type {
  PrismaBiAvancadoRepository,
  ClienteLtv,
  TaxaRecompra,
  CicloRecompraCategoria,
  MargemCategoria,
} from '../../infrastructure/repositories/prisma-bi-avancado.repository.js'

export interface BiAvancado {
  rankingLtv: { clientes: ClienteLtv[]; total: number }
  taxaRecompra: TaxaRecompra
  cicloRecompraPorCategoria: CicloRecompraCategoria[]
  margemPorCategoria: MargemCategoria[]
}

export class GetBiAvancadoUseCase {
  constructor(private readonly repo: PrismaBiAvancadoRepository) {}

  async execute(params: { inicio: Date; fim: Date; page?: number; limit?: number }): Promise<BiAvancado> {
    const [rankingLtv, taxaRecompra, cicloRecompraPorCategoria, margemPorCategoria] = await Promise.all([
      this.repo.findRankingLtv({ page: params.page ?? 1, limit: params.limit ?? 20 }),
      this.repo.getTaxaRecompra(),
      this.repo.getCicloRecompraPorCategoria(),
      this.repo.getMargemPorCategoria(params.inicio, params.fim),
    ])

    return { rankingLtv, taxaRecompra, cicloRecompraPorCategoria, margemPorCategoria }
  }
}
