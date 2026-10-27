import type { IVendaRepository } from '../../domain/repositories/venda.repository.interface.js'
import type { Venda } from '../../domain/entities/venda.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

/** Exclui um recebimento lançado errado; o valor volta a ficar em aberto (specs/vendas/spec-v6.md). */
export class RemoverPagamentoVendaUseCase {
  constructor(private readonly vendaRepo: IVendaRepository) {}

  async execute({ vendaId, pagamentoId }: { vendaId: string; pagamentoId: string }): Promise<Venda> {
    const venda = await this.vendaRepo.findById(vendaId)
    if (!venda) throw new NotFoundError('NOT_FOUND', 'Venda não encontrada')
    if (!venda.removerPagamento(pagamentoId)) throw new NotFoundError('NOT_FOUND', 'Recebimento não encontrado')
    await this.vendaRepo.save(venda)
    return venda
  }
}
