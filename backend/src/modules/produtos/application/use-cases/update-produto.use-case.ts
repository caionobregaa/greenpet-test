import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface.js'
import type { Produto } from '../../domain/entities/produto.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'
import { ConflictError } from '@/shared/errors/conflict.error.js'

export class UpdateProdutoUseCase {
  constructor(private readonly repo: IProdutoRepository) {}

  async execute(input: { id: string } & Parameters<Produto['update']>[0]): Promise<Produto> {
    const { id, ...fields } = input
    const produto = await this.repo.findById(id)
    if (!produto) throw new NotFoundError('NOT_FOUND', 'Produto não encontrado')

    if (fields.nome && fields.nome !== produto.nome) {
      const conflict = await this.repo.findByNome(fields.nome)
      if (conflict) throw new ConflictError('NOME_ALREADY_EXISTS', 'Produto com este nome já existe')
    }

    produto.update(fields)
    await this.repo.save(produto)
    return produto
  }
}
