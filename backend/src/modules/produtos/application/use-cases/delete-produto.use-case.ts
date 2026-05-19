import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

export class DeleteProdutoUseCase {
  constructor(private readonly repo: IProdutoRepository) {}

  async execute({ id }: { id: string }): Promise<void> {
    const produto = await this.repo.findById(id)
    if (!produto) throw new NotFoundError('NOT_FOUND', 'Produto não encontrado')
    produto.softDelete()
    await this.repo.save(produto)
  }
}
