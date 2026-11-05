import type { IProdutoRepository } from '../../domain/repositories/produto.repository.interface.js'
import { Produto } from '../../domain/entities/produto.entity.js'
import { ConflictError } from '@/shared/errors/conflict.error.js'
import { normalizarNomeProduto } from '../../domain/produto-nome.js'

export interface CreateProdutoInput {
  nome: string
  categoria: string
  especie?: string
  subCategoria?: string
  faseDaVida?: string
  porte?: string
  sabor?: string
  marca?: string
  fornecedor?: string
  codigoBarras?: string | null
  semCodigoBarras?: boolean
  pesoEmbalagem?: number | null
  unidadeEmbalagem?: string
  valorCusto?: number
  valorVenda: number
  margemCartao?: number
  margemImposto?: number
  margemOperacao?: number
  margemLucro?: number
  diasRecompra?: number
  estoqueMinimo?: number | null
  descricao?: string
  imagemUrl?: string | null
  ocultarCatalogo?: boolean
  categoriasAdicionais?: string[]
}

export class CreateProdutoUseCase {
  constructor(private readonly repo: IProdutoRepository) {}

  async execute(input: CreateProdutoInput): Promise<Produto> {
    const nome = normalizarNomeProduto(input.nome, input.categoria)
    const existing = await this.repo.findByNome(nome)
    if (existing) throw new ConflictError('NOME_ALREADY_EXISTS', 'Produto com este nome já existe')

    // SKU é sempre gerado pelo backend a partir da categoria — nunca vem do input do usuário.
    const sku = await this.repo.generateSkuForCategoria(input.categoria)
    const produto = Produto.create({
      ...input,
      nome,
      sku,
      imagemUrl: input.imagemUrl ?? undefined,
      pesoEmbalagem: input.pesoEmbalagem ?? undefined,
      estoqueMinimo: input.estoqueMinimo ?? undefined,
    })
    await this.repo.save(produto)
    return produto
  }
}
