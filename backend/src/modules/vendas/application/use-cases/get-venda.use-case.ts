import type { IVendaRepository } from '../../domain/repositories/venda.repository.interface.js'
import type { Venda } from '../../domain/entities/venda.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export class GetVendaUseCase {
  constructor(private readonly repo: IVendaRepository) {}

  async execute({ id }: { id: string }): Promise<Venda> {
    const venda = await this.repo.findById(id)
    if (!venda) throw new NotFoundError('NOT_FOUND', 'Venda não encontrada')
    return venda
  }
}
