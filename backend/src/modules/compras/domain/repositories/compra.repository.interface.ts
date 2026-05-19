import type { Compra } from '../entities/compra.entity.js'

export interface ICompraRepository {
  findById(id: string): Promise<Compra | null>
  findMany(params: {
    status?: string
    fornecedor?: string
    page: number
    limit: number
  }): Promise<{ compras: Compra[]; total: number }>
  save(compra: Compra): Promise<void>
  delete(id: string): Promise<void>
}
