import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface.js'
import type { Produto } from '../../domain/entities/produto.entity.js'

export class ListProdutosUseCase {
  constructor(private readonly repo: IProdutoRepository) {}

  async execute(params: {
    q?: string
    categoria?: string
    especie?: string
    fornecedor?: string
    marca?: string
    page?: number
    limit?: number
  }): Promise<{ produtos: Produto[]; total: number }> {
    return this.repo.findMany({
      q: params.q,
      categoria: params.categoria,
      especie: params.especie,
      fornecedor: params.fornecedor,
      marca: params.marca,
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    })
  }
}
