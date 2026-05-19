import type { ICompraRepository } from '../../domain/repositories/compra.repository.interface.js'
import { Compra, type CompraItemData } from '../../domain/entities/compra.entity.js'

export interface CreateCompraInput {
  fornecedor: string
  dataPedido?: Date
  obs?: string
  itens: CompraItemData[]
}

export class CreateCompraUseCase {
  constructor(private readonly repo: ICompraRepository) {}

  async execute(input: CreateCompraInput): Promise<Compra> {
    const compra = Compra.create(input)
    await this.repo.save(compra)
    return compra
  }
}
