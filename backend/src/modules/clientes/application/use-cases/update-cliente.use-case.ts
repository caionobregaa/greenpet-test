import type { IClienteRepository } from '../../domain/repositories/cliente.repository.interface.js'
import type { Cliente } from '../../domain/entities/cliente.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'
import { ConflictError } from '@/shared/errors/conflict.error.js'

export interface UpdateClienteInput {
  id: string
  nome?: string
  telefone?: string
  email?: string
  cpf?: string
  endereco?: string
  cidade?: string
  obs?: string
}

export class UpdateClienteUseCase {
  constructor(private readonly repo: IClienteRepository) {}

  async execute(input: UpdateClienteInput): Promise<Cliente> {
    const { id, ...fields } = input
    const cliente = await this.repo.findById(id)
    if (!cliente) throw new NotFoundError('NOT_FOUND', 'Cliente não encontrado')

    if (fields.email && fields.email !== cliente.email) {
      const conflict = await this.repo.findByEmail(fields.email)
      if (conflict) throw new ConflictError('EMAIL_ALREADY_EXISTS', 'E-mail já cadastrado')
    }

    if (fields.cpf && fields.cpf !== cliente.cpf) {
      const conflict = await this.repo.findByCpf(fields.cpf)
      if (conflict) throw new ConflictError('CPF_ALREADY_EXISTS', 'CPF já cadastrado')
    }

    cliente.update(fields)
    await this.repo.save(cliente)
    return cliente
  }
}
