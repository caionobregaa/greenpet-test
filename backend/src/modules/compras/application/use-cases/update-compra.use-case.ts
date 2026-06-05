import type { ICompraRepository } from '../../domain/repositories/compra.repository.interface.js'
import type { Compra, CompraItemData } from '../../domain/entities/compra.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export interface UpdateCompraInput {
  id: string
  fornecedor?: string
  obs?: string
  dataPedido?: Date
  categoria?: string
  descricaoSimples?: string
  totalManual?: number
  itens?: CompraItemData[]
}

export class UpdateCompraUseCase {
  constructor(private readonly repo: ICompraRepository) {}

  async execute(input: UpdateCompraInput): Promise<Compra> {
    const { id, ...fields } = input
    const compra = await this.repo.findById(id)
    if (!compra) throw new NotFoundError('NOT_FOUND', 'Compra não encontrada')
    compra.update(fields)
    await this.repo.save(compra)
    return compra
  }
}
