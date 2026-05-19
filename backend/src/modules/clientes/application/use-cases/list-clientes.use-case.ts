import type { IClienteRepository } from '../../domain/repositories/cliente.repository.interface.js'
import type { Cliente } from '../../domain/entities/cliente.entity.js'

export interface ListClientesInput {
  q?: string
  cidade?: string
  page?: number
  limit?: number
}

export interface ListClientesOutput {
  clientes: Cliente[]
  total: number
}

export class ListClientesUseCase {
  constructor(private readonly repo: IClienteRepository) {}

  async execute(input: ListClientesInput = {}): Promise<ListClientesOutput> {
    const page = input.page ?? 1
    const limit = input.limit ?? 20
    return this.repo.findMany({ q: input.q, cidade: input.cidade, page, limit })
  }
}
