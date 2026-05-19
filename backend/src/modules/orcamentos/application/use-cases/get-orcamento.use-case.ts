import type { IOrcamentoRepository } from '../../domain/repositories/orcamento.repository.interface.js'
import type { Orcamento } from '../../domain/entities/orcamento.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export class GetOrcamentoUseCase {
  constructor(private readonly repo: IOrcamentoRepository) {}

  async execute({ id }: { id: string }): Promise<Orcamento> {
    const o = await this.repo.findById(id)
    if (!o) throw new NotFoundError('NOT_FOUND', 'Orçamento não encontrado')
    return o
  }
}
