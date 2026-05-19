import type { IOrcamentoRepository } from '../../domain/repositories/orcamento.repository.interface.js'
import type { Orcamento } from '../../domain/entities/orcamento.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'
import { ValidationError } from '@/shared/errors/validation.error.js'

export class UpdateOrcamentoStatusUseCase {
  constructor(private readonly repo: IOrcamentoRepository) {}

  async execute({ id, acao }: { id: string; acao: 'aprovar' | 'recusar' | 'reabrir' }): Promise<Orcamento> {
    const orcamento = await this.repo.findById(id)
    if (!orcamento) throw new NotFoundError('NOT_FOUND', 'Orçamento não encontrado')

    if (acao === 'aprovar') orcamento.aprovar()
    else if (acao === 'recusar') orcamento.recusar()
    else if (acao === 'reabrir') orcamento.reabrir()
    else throw new ValidationError('VALIDATION_ERROR', `Ação inválida: ${acao}`)

    await this.repo.save(orcamento)
    return orcamento
  }
}
