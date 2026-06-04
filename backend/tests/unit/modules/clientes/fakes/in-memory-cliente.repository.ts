import type { IClienteRepository } from '@/modules/clientes/domain/repositories/cliente.repository.interface'
import { Cliente } from '@/modules/clientes/domain/entities/cliente.entity'
import type { Animal } from '@/modules/animais/domain/entities/animal.entity'

export class InMemoryClienteRepository implements IClienteRepository {
  public items: Cliente[] = []
  public simulateActiveSales = false
  /** Quando definido, numeroDeAnimais é computado dinamicamente a partir desta lista. */
  public animalItems?: Animal[]

  private withCount(c: Cliente): Cliente {
    if (!this.animalItems) return c
    const count = this.animalItems.filter((a) => a.clienteId === c.id && a.isActive).length
    return Cliente.create({
      id: c.id,
      nome: c.nome,
      telefone: c.telefone,
      email: c.email,
      cpf: c.cpf,
      endereco: c.endereco,
      bairro: c.bairro,
      cidade: c.cidade,
      obs: c.obs,
      deletedAt: c.deletedAt,
      numeroDeAnimais: count,
    })
  }

  async findById(id: string): Promise<Cliente | null> {
    const found = this.items.find((c) => c.id === id && c.isActive)
    return found ? this.withCount(found) : null
  }

  async findByEmail(email: string): Promise<Cliente | null> {
    return this.items.find((c) => c.email === email && c.isActive) ?? null
  }

  async findByCpf(cpf: string): Promise<Cliente | null> {
    return this.items.find((c) => c.cpf === cpf && c.isActive) ?? null
  }

  async findMany(params: { q?: string; cidade?: string; page: number; limit: number }) {
    const filtered = this.items.filter((c) => {
      if (!c.isActive) return false
      if (params.q) return c.nome.toLowerCase().includes(params.q.toLowerCase())
      return true
    })
    const start = (params.page - 1) * params.limit
    return {
      clientes: filtered.slice(start, start + params.limit).map((c) => this.withCount(c)),
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
