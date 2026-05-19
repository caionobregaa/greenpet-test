import type { IOrcamentoRepository } from '../../domain/repositories/orcamento.repository.interface.js'
import type { IVendaRepository } from '@/modules/vendas/domain/repositories/venda.repository.interface.js'
import { Venda } from '@/modules/vendas/domain/entities/venda.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'
import { UnprocessableError } from '@/shared/errors/unprocessable.error.js'

export class ConverterOrcamentoUseCase {
  constructor(
    private readonly orcamentoRepo: IOrcamentoRepository,
    private readonly vendaRepo: IVendaRepository,
  ) {}

  async execute({ id, formaPag }: { id: string; formaPag: string }): Promise<Venda> {
    const orcamento = await this.orcamentoRepo.findById(id)
    if (!orcamento) throw new NotFoundError('NOT_FOUND', 'Orçamento não encontrado')

    if (orcamento.status === 'aprovado' && orcamento.vendaId) {
      throw new UnprocessableError('ALREADY_CONVERTED', 'Orçamento já foi convertido em venda')
    }

    if (orcamento.status === 'recusado') {
      throw new UnprocessableError('INVALID_STATUS', 'Orçamento recusado não pode ser convertido')
    }

    const venda = Venda.create({
      clienteId: orcamento.clienteId,
      animalId: orcamento.animalId,
      data: new Date(),
      formaPag,
      obs: orcamento.obs,
      itens: orcamento.itens.map((i) => ({
        produtoId: i.produtoId,
        nome: i.nome,
        qtd: i.qtd,
        valorUnitario: i.valorUnitario,
      })),
    })

    await this.vendaRepo.save(venda)
    orcamento.vincularVenda(venda.id)
    await this.orcamentoRepo.save(orcamento)

    return venda
  }
}
