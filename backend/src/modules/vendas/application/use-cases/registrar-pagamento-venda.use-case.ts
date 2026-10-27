import type { IVendaRepository } from '../../domain/repositories/venda.repository.interface.js'
import type { Venda } from '../../domain/entities/venda.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export interface RegistrarPagamentoVendaInput {
  vendaId: string
  valor: number
  data?: Date
  formaPag: string
  obs?: string
}

/** Recebe parte (ou todo) o valor em aberto de uma venda (specs/vendas/spec-v6.md). */
export class RegistrarPagamentoVendaUseCase {
  constructor(private readonly vendaRepo: IVendaRepository) {}

  async execute({ vendaId, ...pagamento }: RegistrarPagamentoVendaInput): Promise<Venda> {
    const venda = await this.vendaRepo.findById(vendaId)
    if (!venda) throw new NotFoundError('NOT_FOUND', 'Venda não encontrada')
    venda.registrarPagamento(pagamento)
    await this.vendaRepo.save(venda)
    return venda
  }
}
