import type { IOrcamentoRepository } from '../../domain/repositories/orcamento.repository.interface.js'
import type { IClienteRepository } from '@/modules/clientes/domain/repositories/cliente.repository.interface.js'
import { Orcamento, type OrcamentoItemData } from '../../domain/entities/orcamento.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export interface CreateOrcamentoInput {
  clienteId: string
  animalId?: string
  data?: Date
  validade: Date
  obs?: string
  itens: OrcamentoItemData[]
}

export class CreateOrcamentoUseCase {
  constructor(
    private readonly orcamentoRepo: IOrcamentoRepository,
    private readonly clienteRepo: IClienteRepository,
  ) {}

  async execute(input: CreateOrcamentoInput): Promise<Orcamento> {
    const cliente = await this.clienteRepo.findById(input.clienteId)
    if (!cliente) throw new NotFoundError('NOT_FOUND', 'Cliente não encontrado')

    const orcamento = Orcamento.create(input)
    await this.orcamentoRepo.save(orcamento)
    return orcamento
  }
}
