import type { IClienteRepository } from '@/modules/clientes/domain/repositories/cliente.repository.interface'
import { Cliente } from '@/modules/clientes/domain/entities/cliente.entity'

export class InMemoryClienteRepository implements IClienteRepository {
  public items: Cliente[] = []
  public simulateActiveSales = false

  async findById(id: string): Promise<Cliente | null> {
    return this.items.find((c) => c.id === id && c.isActive) ?? null
  }

  async findByEmail(email: string): Promise<Cliente | null> {
    return this.items.find((c) => c.email === email && c.isActive) ?? null
  }

  async findByCpf(cpf: string): Promise<Cliente | null> {
    return this.items.find((c) => c.cpf === cpf && c.isActive) ?? null
  }

  async findMany(params: { q?: string; page: number; limit: number }) {
    const filtered = this.items.filter((c) => {
      if (!c.isActive) return false
      if (params.q) return c.nome.toLowerCase().includes(params.q.toLowerCase())
      return true
    })
    const start = (params.page - 1) * params.limit
    return {
      clientes: filtered.slice(start, start + params.limit),
      total: filtered.length,
    }
  }

  async save(cliente: Cliente): Promise<void> {
    const idx = this.items.findIndex((c) => c.id === cliente.id)
    if (idx >= 0) this.items[idx] = cliente
    else this.items.push(cliente)
  }

  async hasActiveSalesOrQuotes(_clienteId: string): Promise<boolean> {
    return this.simulateActiveSales
  }
}
