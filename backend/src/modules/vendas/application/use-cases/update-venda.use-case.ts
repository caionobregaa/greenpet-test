import type { IVendaRepository } from '../../domain/repositories/venda.repository.interface.js'
import { Venda, type VendaItemData } from '../../domain/entities/venda.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export interface UpdateVendaInput {
  id: string
  animalId?: string
  data?: Date
  formaPag?: string
  taxaCartao?: number
  taxaEntrega?: number
  desconto?: number
  obs?: string
  itens?: VendaItemData[]
}

export class UpdateVendaUseCase {
  constructor(private readonly vendaRepo: IVendaRepository) {}

  async execute(input: UpdateVendaInput): Promise<Venda> {
    const existing = await this.vendaRepo.findById(input.id)
    if (!existing) throw new NotFoundError('NOT_FOUND', 'Venda não encontrada')

    const updated = Venda.create({
      id: existing.id,
      clienteId: existing.clienteId,
      animalId: input.animalId !== undefined ? input.animalId : existing.animalId,
      data: input.data ?? existing.data,
      formaPag: input.formaPag ?? existing.formaPag,
      taxaCartao: input.taxaCartao ?? existing.taxaCartao,
      taxaEntrega: input.taxaEntrega ?? existing.taxaEntrega,
      desconto: input.desconto ?? existing.desconto,
      obs: input.obs !== undefined ? input.obs : existing.obs,
      itens: input.itens ?? existing.itens,
    })

    await this.vendaRepo.save(updated)
    return updated
  }
}
