import { AggregateRoot } from '@/shared/domain/aggregate-root.base.js'
import { Money } from '@/shared/domain/value-objects/money.vo.js'
import { ValidationError } from '@/shared/errors/validation.error.js'

const CATEGORIAS_VALIDAS = ['Ração', 'Petisco', 'Medicamento', 'Acessório', 'Higiene', 'Serviço'] as const
type Categoria = (typeof CATEGORIAS_VALIDAS)[number]

interface ProdutoProps {
  nome: string
  categoria: Categoria
  especie?: string
  subCategoria?: string
  marca?: string
  fornecedor?: string
  pesoEmbalagem?: number
  valorCusto: Money
  valorVenda: Money
  margemCartao: number
  margemImposto: number
  margemOperacao: number
  margemLucro: number
  diasRecompra?: number
  descricao?: string
  imagemUrl?: string
  deletedAt?: Date
}

export class Produto extends AggregateRoot<ProdutoProps> {
  static create(data: {
    id?: string
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
    imagemUrl?: string
    deletedAt?: Date
  }): Produto {
    if (!CATEGORIAS_VALIDAS.includes(data.categoria as Categoria)) {
      throw new ValidationError('VALIDATION_ERROR', `Categoria inválida: ${data.categoria}. Use: ${CATEGORIAS_VALIDAS.join(', ')}`)
    }
    return new Produto(
      {
        nome: data.nome,
        categoria: data.categoria as Categoria,
        especie: data.especie,
        subCategoria: data.subCategoria,
        marca: data.marca,
        fornecedor: data.fornecedor,
        pesoEmbalagem: data.pesoEmbalagem,
        valorCusto: Money.create(data.valorCusto ?? 0),
        valorVenda: Money.create(data.valorVenda),
        margemCartao: data.margemCartao ?? 0,
        margemImposto: data.margemImposto ?? 0,
        margemOperacao: data.margemOperacao ?? 0,
        margemLucro: data.margemLucro ?? 0,
        diasRecompra: data.diasRecompra,
        descricao: data.descricao,
        imagemUrl: data.imagemUrl,
        deletedAt: data.deletedAt,
      },
      data.id,
    )
  }

  get nome(): string { return this.props.nome }
  get categoria(): string { return this.props.categoria }
  get especie(): string | undefined { return this.props.especie }
  get subCategoria(): string | undefined { return this.props.subCategoria }
  get marca(): string | undefined { return this.props.marca }
  get fornecedor(): string | undefined { return this.props.fornecedor }
  get pesoEmbalagem(): number | undefined { return this.props.pesoEmbalagem }
  get valorCusto(): number { return this.props.valorCusto.value }
  get valorVenda(): number { return this.props.valorVenda.value }
  get margemCartao(): number { return this.props.margemCartao }
  get margemImposto(): number { return this.props.margemImposto }
  get margemOperacao(): number { return this.props.margemOperacao }
  get margemLucro(): number { return this.props.margemLucro }
  get diasRecompra(): number | undefined { return this.props.diasRecompra }
  get descricao(): string | undefined { return this.props.descricao }
  get imagemUrl(): string | undefined { return this.props.imagemUrl }
  get deletedAt(): Date | undefined { return this.props.deletedAt }
  get isActive(): boolean { return !this.props.deletedAt }

  get margemCalculada(): number {
    const venda = this.props.valorVenda.value
    if (venda === 0) return 0
    const custo = this.props.valorCusto.value
    return Math.round(((venda - custo) / venda) * 100 * 100) / 100
  }

  softDelete(): void {
    if (this.props.deletedAt) return
    this.props.deletedAt = new Date()
  }

  update(fields: Partial<{
    nome: string
    categoria: string
    especie: string
    subCategoria: string
    marca: string
    fornecedor: string
    pesoEmbalagem: number
    valorCusto: number
    valorVenda: number
    margemCartao: number
    margemImposto: number
    margemOperacao: number
    margemLucro: number
    diasRecompra: number
    descricao: string
    imagemUrl: string | null
  }>): void {
    if (fields.nome !== undefined) this.props.nome = fields.nome
    if (fields.categoria !== undefined) {
      if (!CATEGORIAS_VALIDAS.includes(fields.categoria as Categoria)) {
        throw new ValidationError('VALIDATION_ERROR', `Categoria inválida: ${fields.categoria}`)
      }
      this.props.categoria = fields.categoria as Categoria
    }
    if (fields.valorCusto !== undefined) this.props.valorCusto = Money.create(fields.valorCusto)
    if (fields.valorVenda !== undefined) this.props.valorVenda = Money.create(fields.valorVenda)
    if (fields.especie !== undefined) this.props.especie = fields.especie
    if (fields.subCategoria !== undefined) this.props.subCategoria = fields.subCategoria
    if (fields.marca !== undefined) this.props.marca = fields.marca
    if (fields.fornecedor !== undefined) this.props.fornecedor = fields.fornecedor
    if (fields.pesoEmbalagem !== undefined) this.props.pesoEmbalagem = fields.pesoEmbalagem
    if (fields.margemCartao !== undefined) this.props.margemCartao = fields.margemCartao
    if (fields.margemImposto !== undefined) this.props.margemImposto = fields.margemImposto
    if (fields.margemOperacao !== undefined) this.props.margemOperacao = fields.margemOperacao
    if (fields.margemLucro !== undefined) this.props.margemLucro = fields.margemLucro
    if (fields.diasRecompra !== undefined) this.props.diasRecompra = fields.diasRecompra
    if (fields.descricao !== undefined) this.props.descricao = fields.descricao
    if (fields.imagemUrl !== undefined) this.props.imagemUrl = fields.imagemUrl ?? undefined
    this.updatedAt = new Date()
  }
}
