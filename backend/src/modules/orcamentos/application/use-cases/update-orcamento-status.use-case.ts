import type { IOrcamentoRepository } from '../../domain/repositories/orcamento.repository.interface.js'
import type { Orcamento, MotivoPerda } from '../../domain/entities/orcamento.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'
import { ValidationError } from '@/shared/errors/validation.error.js'

export class UpdateOrcamentoStatusUseCase {
  constructor(private readonly repo: IOrcamentoRepository) {}

  async execute({ id, acao, motivo }: { id: string; acao: 'fechar' | 'perder' | 'reabrir'; motivo?: MotivoPerda }): Promise<Orcamento> {
    const orcamento = await this.repo.findById(id)
    if (!orcamento) throw new NotFoundError('NOT_FOUND', 'Orçamento não encontrado')

    if (acao === 'fechar') orcamento.fechar()
    else if (acao === 'perder') orcamento.perder(motivo as MotivoPerda)
    else if (acao === 'reabrir') orcamento.reabrir()
    else throw new ValidationError('VALIDATION_ERROR', `Ação inválida: ${acao}`)

    await this.repo.save(orcamento)
    return orcamento
  }
}
