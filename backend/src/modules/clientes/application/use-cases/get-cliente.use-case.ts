import type { IClienteRepository } from '../../domain/repositories/cliente.repository.interface.js'
import type { Cliente } from '../../domain/entities/cliente.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export class GetClienteUseCase {
  constructor(private readonly repo: IClienteRepository) {}

  async execute({ id }: { id: string }): Promise<Cliente> {
    const cliente = await this.repo.findById(id)
    if (!cliente) throw new NotFoundError('NOT_FOUND', 'Cliente não encontrado')
    return cliente
  }
}
