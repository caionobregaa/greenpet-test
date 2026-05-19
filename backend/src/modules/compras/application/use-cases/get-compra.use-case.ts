import type { ICompraRepository } from '../../domain/repositories/compra.repository.interface.js'
import type { Compra } from '../../domain/entities/compra.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export class GetCompraUseCase {
  constructor(private readonly repo: ICompraRepository) {}

  async execute({ id }: { id: string }): Promise<Compra> {
    const compra = await this.repo.findById(id)
    if (!compra) throw new NotFoundError('NOT_FOUND', 'Compra não encontrada')
    return compra
  }
}
