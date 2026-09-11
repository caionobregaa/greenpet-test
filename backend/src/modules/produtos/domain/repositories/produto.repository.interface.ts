import type { Produto } from '../entities/produto.entity.js'

export interface IProdutoRepository {
  findById(id: string): Promise<Produto | null>
  findByNome(nome: string): Promise<Produto | null>
  findBySku(sku: string): Promise<Produto | null>
  /** Gera o próximo SKU disponível para a categoria (ex.: "RAC-0001"), via sequence no banco. */
  generateSkuForCategoria(categoria: string): Promise<string>
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
