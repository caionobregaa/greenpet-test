import type { IOrcamentoRepository } from '../../domain/repositories/orcamento.repository.interface.js'
import type { Orcamento } from '../../domain/entities/orcamento.entity.js'

export class ListOrcamentosUseCase {
  constructor(private readonly repo: IOrcamentoRepository) {}

  async execute(params: {
    clienteId?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<{ orcamentos: Orcamento[]; total: number }> {
    return this.repo.findMany({
      clienteId: params.clienteId,
      status: params.status,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    })
  }
}
