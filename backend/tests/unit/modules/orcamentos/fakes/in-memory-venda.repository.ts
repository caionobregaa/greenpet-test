import type { IVendaRepository } from '@/modules/vendas/domain/repositories/venda.repository.interface'
import { Venda } from '@/modules/vendas/domain/entities/venda.entity'

export class InMemoryVendaRepository implements IVendaRepository {
  public items: Venda[] = []

  async findById(id: string): Promise<Venda | null> {
    return this.items.find((v) => v.id === id) ?? null
  }

  async findMany(params: { clienteId?: string; animalId?: string; page: number; limit: number }) {
    const filtered = this.items.filter((v) => {
      if (params.clienteId && v.clienteId !== params.clienteId) return false
      if (params.animalId && v.animalId !== params.animalId) return false
      return true
    })
    const start = (params.page - 1) * params.limit
    return { vendas: filtered.slice(start, start + params.limit), total: filtered.length }
  }

  async save(venda: Venda): Promise<void> {
    const idx = this.items.findIndex((v) => v.id === venda.id)
    if (idx >= 0) this.items[idx] = venda
    else this.items.push(venda)
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((v) => v.id !== id)
  }
}
