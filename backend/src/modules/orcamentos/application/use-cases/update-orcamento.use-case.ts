import type { IOrcamentoRepository } from '../../domain/repositories/orcamento.repository.interface.js'
import type { OrcamentoItemData } from '../../domain/entities/orcamento.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export interface UpdateOrcamentoInput {
  id: string
  validade?: Date
  obs?: string
  itens?: OrcamentoItemData[]
}

export class UpdateOrcamentoUseCase {
  constructor(private readonly repo: IOrcamentoRepository) {}

  async execute(input: UpdateOrcamentoInput) {
    const orcamento = await this.repo.findById(input.id)
    if (!orcamento) throw new NotFoundError('NOT_FOUND', 'Orçamento não encontrado')

    orcamento.update({
      validade: input.validade,
      obs: input.obs,
      itens: input.itens,
    })

    await this.repo.save(orcamento)
    return orcamento
  }
}
