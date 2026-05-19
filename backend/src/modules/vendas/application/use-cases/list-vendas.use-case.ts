import type { IVendaRepository } from '../../domain/repositories/venda.repository.interface.js'
import type { Venda } from '../../domain/entities/venda.entity.js'

export class ListVendasUseCase {
  constructor(private readonly repo: IVendaRepository) {}

  async execute(params: {
    clienteId?: string
    animalId?: string
    page?: number
    limit?: number
  }): Promise<{ vendas: Venda[]; total: number }> {
    return this.repo.findMany({
      clienteId: params.clienteId,
      animalId: params.animalId,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    })
  }
}
