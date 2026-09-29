import type { Compra } from '../entities/compra.entity.js'

export interface ICompraRepository {
  findById(id: string): Promise<Compra | null>
  findMany(params: {
    status?: string
    categoria?: string
    fornecedor?: string
    mes?: string
    page: number
    limit: number
  }): Promise<{ compras: Compra[]; total: number; totalValor: number }>
  save(compra: Compra): Promise<void>
  delete(id: string): Promise<void>
}
