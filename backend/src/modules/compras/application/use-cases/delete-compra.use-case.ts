import type { ICompraRepository } from '../../domain/repositories/compra.repository.interface.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'
import { UnprocessableError } from '@/shared/errors/unprocessable.error.js'

export class DeleteCompraUseCase {
  constructor(private readonly repo: ICompraRepository) {}

  async execute({ id }: { id: string }): Promise<void> {
    const compra = await this.repo.findById(id)
    if (!compra) throw new NotFoundError('NOT_FOUND', 'Compra não encontrada')
    if (compra.status !== 'pendente') {
      throw new UnprocessableError('CANNOT_DELETE', 'Apenas compras pendentes podem ser removidas')
    }
    await this.repo.delete(id)
  }
}
