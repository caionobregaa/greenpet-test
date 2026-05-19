import type { IOrcamentoRepository } from '../../domain/repositories/orcamento.repository.interface.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'
import { UnprocessableError } from '@/shared/errors/unprocessable.error.js'

export class DeleteOrcamentoUseCase {
  constructor(private readonly repo: IOrcamentoRepository) {}

  async execute({ id }: { id: string }): Promise<void> {
    const o = await this.repo.findById(id)
    if (!o) throw new NotFoundError('NOT_FOUND', 'Orçamento não encontrado')
    if (o.status === 'aprovado' && o.vendaId) {
      throw new UnprocessableError('CANNOT_DELETE_CONVERTED', 'Orçamento convertido em venda não pode ser removido')
    }
    await this.repo.delete(id)
  }
}
