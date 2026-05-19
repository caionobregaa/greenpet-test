import type { ICompraRepository } from '../../domain/repositories/compra.repository.interface.js'
import type { Compra } from '../../domain/entities/compra.entity.js'

export class ListComprasUseCase {
  constructor(private readonly repo: ICompraRepository) {}

  async execute(params: {
    status?: string
    fornecedor?: string
    page?: number
    limit?: number
  }): Promise<{ compras: Compra[]; total: number }> {
    return this.repo.findMany({
      status: params.status,
      fornecedor: params.fornecedor,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    })
  }
}
