import type { IOrcamentoRepository } from '@/modules/orcamentos/domain/repositories/orcamento.repository.interface'
import { Orcamento } from '@/modules/orcamentos/domain/entities/orcamento.entity'

export class InMemoryOrcamentoRepository implements IOrcamentoRepository {
  public items: Orcamento[] = []

  async findById(id: string): Promise<Orcamento | null> {
    return this.items.find((o) => o.id === id) ?? null
  }

  async findMany(params: { clienteId?: string; status?: string; motivoPerda?: string; page: number; limit: number }) {
    const filtered = this.items.filter((o) => {
      if (params.clienteId && o.clienteId !== params.clienteId) return false
      if (params.status && o.status !== params.status) return false
      if (params.motivoPerda && o.motivoPerda !== params.motivoPerda) return false
      return true
    })
    const start = (params.page - 1) * params.limit
    return { orcamentos: filtered.slice(start, start + params.limit), total: filtered.length }
  }

  async save(orcamento: Orcamento): Promise<void> {
    const idx = this.items.findIndex((o) => o.id === orcamento.id)
    if (idx >= 0) this.items[idx] = orcamento
    else this.items.push(orcamento)
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((o) => o.id !== id)
  }
}
