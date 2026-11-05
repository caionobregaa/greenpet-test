import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface.js'
import type { Produto } from '../../domain/entities/produto.entity.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'
import { ConflictError } from '@/shared/errors/conflict.error.js'
import { normalizarNomeProduto } from '../../domain/produto-nome.js'

export class UpdateProdutoUseCase {
  constructor(private readonly repo: IProdutoRepository) {}

  async execute(input: { id: string } & Parameters<Produto['update']>[0]): Promise<Produto> {
    const { id, ...fields } = input
    const produto = await this.repo.findById(id)
    if (!produto) throw new NotFoundError('NOT_FOUND', 'Produto não encontrado')

    // "FN" vira "Fórmula Natural" em rações, também ao trocar a categoria (specs/produtos/spec-v9.md)
    const nome = normalizarNomeProduto(fields.nome ?? produto.nome, fields.categoria ?? produto.categoria)
    if (nome !== produto.nome) {
      const conflict = await this.repo.findByNome(nome)
      if (conflict && conflict.id !== produto.id) throw new ConflictError('NOME_ALREADY_EXISTS', 'Produto com este nome já existe')
    }
    if (fields.nome !== undefined || nome !== produto.nome) fields.nome = nome

    produto.update(fields)
    await this.repo.save(produto)
    return produto
  }
}
