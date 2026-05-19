import type { IVendaRepository } from '../../domain/repositories/venda.repository.interface.js'
import type { IClienteRepository } from '@/modules/clientes/domain/repositories/cliente.repository.interface.js'
import { Venda, type VendaItemData } from '../../domain/entities/venda.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export interface CreateVendaInput {
  clienteId: string
  animalId?: string
  data?: Date
  formaPag: string
  obs?: string
  itens: VendaItemData[]
}

export class CreateVendaUseCase {
  constructor(
    private readonly vendaRepo: IVendaRepository,
    private readonly clienteRepo: IClienteRepository,
  ) {}

  async execute(input: CreateVendaInput): Promise<Venda> {
    const cliente = await this.clienteRepo.findById(input.clienteId)
    if (!cliente) throw new NotFoundError('NOT_FOUND', 'Cliente não encontrado')

    const venda = Venda.create(input)
    await this.vendaRepo.save(venda)
    return venda
  }
}
