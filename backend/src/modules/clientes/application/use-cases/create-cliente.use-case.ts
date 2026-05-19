import type { IClienteRepository } from '../../domain/repositories/cliente.repository.interface.js'
import { Cliente } from '../../domain/entities/cliente.entity.js'
import { ConflictError } from '@/shared/errors/conflict.error.js'

export interface CreateClienteInput {
  nome: string
  telefone: string
  email?: string
  cpf?: string
  endereco?: string
  cidade?: string
  obs?: string
}

export class CreateClienteUseCase {
  constructor(private readonly repo: IClienteRepository) {}

  async execute(input: CreateClienteInput): Promise<Cliente> {
    if (input.email) {
      const existing = await this.repo.findByEmail(input.email)
      if (existing) throw new ConflictError('EMAIL_ALREADY_EXISTS', 'E-mail já cadastrado')
    }

    if (input.cpf) {
      const existing = await this.repo.findByCpf(input.cpf)
      if (existing) throw new ConflictError('CPF_ALREADY_EXISTS', 'CPF já cadastrado')
    }

    const cliente = Cliente.create(input)
    await this.repo.save(cliente)
    return cliente
  }
}
