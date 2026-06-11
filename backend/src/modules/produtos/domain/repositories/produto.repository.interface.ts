import type { Produto } from '../entities/produto.entity.js'

export interface IProdutoRepository {
  findById(id: string): Promise<Produto | null>
  findByNome(nome: string): Promise<Produto | null>
  findMany(params: {
    q?: string
    categoria?: string
    especie?: string
    fornecedor?: string
    marca?: string
    page: number
    limit: number
  }): Promise<{ produtos: Produto[]; total: number }>
  save(produto: Produto): Promise<void>
}
