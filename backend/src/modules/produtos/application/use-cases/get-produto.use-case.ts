import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface.js'
import type { Produto } from '../../domain/entities/produto.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export class GetProdutoUseCase {
  constructor(private readonly repo: IProdutoRepository) {}

  async execute({ id }: { id: string }): Promise<Produto> {
    const produto = await this.repo.findById(id)
    if (!produto) throw new NotFoundError('NOT_FOUND', 'Produto não encontrado')
    return produto
  }
}
