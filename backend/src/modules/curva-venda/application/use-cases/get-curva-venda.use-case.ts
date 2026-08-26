import type { PrismaCurvaVendaRepository, CurvaVendaProduto } from '../../infrastructure/repositories/prisma-curva-venda.repository.js'
import type { Curva } from '../../domain/services/curva-abc.service.js'

export class GetCurvaVendaUseCase {
  constructor(private readonly repo: PrismaCurvaVendaRepository) {}

  async execute(params: {
    dataInicio?: Date
    dataFim?: Date
    categoria?: string
    page?: number
    limit?: number
  }): Promise<{ produtos: CurvaVendaProduto[]; total: number; resumo: Record<Curva, number> }> {
    return this.repo.findCurvaAbc({
      dataInicio: params.dataInicio,
      dataFim: params.dataFim,
      categoria: params.categoria,
      page: params.page ?? 1,
      limit: params.limit ?? 50,
    })
  }
}
