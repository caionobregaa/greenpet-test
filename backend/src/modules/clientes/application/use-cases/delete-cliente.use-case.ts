import type { IClienteRepository } from '../../domain/repositories/cliente.repository.interface.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export class DeleteClienteUseCase {
  constructor(private readonly repo: IClienteRepository) {}

  async execute({ id }: { id: string }): Promise<void> {
    const cliente = await this.repo.findById(id)
    if (!cliente) throw new NotFoundError('NOT_FOUND', 'Cliente não encontrado')

    // Soft-delete preserves all historical data (sales, orders, animals)
    cliente.softDelete()
    await this.repo.save(cliente)
  }
}
