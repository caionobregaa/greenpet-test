import type { IVendaRepository } from '../../domain/repositories/venda.repository.interface.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export class DeleteVendaUseCase {
  constructor(private readonly repo: IVendaRepository) {}

  async execute({ id }: { id: string }): Promise<void> {
    const venda = await this.repo.findById(id)
    if (!venda) throw new NotFoundError('NOT_FOUND', 'Venda não encontrada')
    await this.repo.delete(id)
  }
}
