import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface.js'
import { Produto } from '../../domain/entities/produto.entity.js'
import { ConflictError } from '@/shared/errors/conflict.error.js'

export interface CreateProdutoInput {
  nome: string
  categoria: string
  especie?: string
  subCategoria?: string
  marca?: string
  fornecedor?: string
  pesoEmbalagem?: number
  valorCusto?: number
  valorVenda: number
  margemCartao?: number
  margemImposto?: number
  margemOperacao?: number
  margemLucro?: number
  diasRecompra?: number
  descricao?: string
  imagemUrl?: string | null
}

export class CreateProdutoUseCase {
  constructor(private readonly repo: IProdutoRepository) {}

  async execute(input: CreateProdutoInput): Promise<Produto> {
    const existing = await this.repo.findByNome(input.nome)
    if (existing) throw new ConflictError('NOME_ALREADY_EXISTS', 'Produto com este nome já existe')

    const produto = Produto.create({ ...input, imagemUrl: input.imagemUrl ?? undefined })
    await this.repo.save(produto)
    return produto
  }
}
