import { AggregateRoot } from '@/shared/domain/aggregate-root.base.js'
import { Money } from '@/shared/domain/value-objects/money.vo.js'
import { ValidationError } from '@/shared/errors/validation.error.js'

export type OrcamentoStatus = 'aberto' | 'fechado' | 'perdido'

export type MotivoPerda =
  | 'Preço'
  | 'Cliente desistiu'
  | 'Comprou concorrente'
  | 'Sem estoque'
  | 'Produto indisponível'
  | 'Frete/prazo'
  | 'Parou de responder'
  | 'Outro'

export const MOTIVOS_PERDA: MotivoPerda[] = [
  'Preço',
  'Cliente desistiu',
  'Comprou concorrente',
  'Sem estoque',
  'Produto indisponível',
  'Frete/prazo',
  'Parou de responder',
  'Outro',
]

export interface OrcamentoItemData {
  id?: string
  produtoId?: string
  nome: string
  qtd: number
  valorUnitario: number
  desconto?: number
}

export interface OrcamentoItemReadOnly {
  id: string
  produtoId?: string
  nome: string
  qtd: number
  valorUnitario: number
  desconto: number
  total: number
}

interface OrcamentoProps {
  clienteId?: string
  animalId?: string
  data: Date
  validade: Date
  status: OrcamentoStatus
  motivoPerda?: MotivoPerda
  total: Money
  obs?: string
  vendaId?: string
  formasPag: string[]
  descontoRecompraAplicado: boolean
  valorDescontoRecompra?: number
  itens: OrcamentoItemReadOnly[]
}

export class Orcamento extends AggregateRoot<OrcamentoProps> {
  private _numero: number = 0

  applyNumero(n: number): void { this._numero = n }
  get numero(): number { return this._numero }

  static create(data: {
    id?: string
    clienteId?: string
    animalId?: string
    data?: Date
    validade: Date
    status?: OrcamentoStatus
    motivoPerda?: MotivoPerda
    obs?: string
    vendaId?: string
    formasPag?: string[]
    descontoRecompraAplicado?: boolean
    valorDescontoRecompra?: number
    itens: OrcamentoItemData[]
  }): Orcamento {
    const status = data.status ?? 'aberto'
    if (status === 'perdido' && !data.motivoPerda) {
      throw new ValidationError('VALIDATION_ERROR', 'motivoPerda é obrigatório para orçamento perdido')
    }

    const itens: OrcamentoItemReadOnly[] = data.itens.map((item) => ({
      id: item.id ?? crypto.randomUUID(),
      produtoId: item.produtoId,
      nome: item.nome,
      qtd: item.qtd,
      valorUnitario: item.valorUnitario,
      desconto: item.desconto ?? 0,
      total: Math.max(0, Money.create(item.valorUnitario).multiply(item.qtd).value - (item.desconto ?? 0)),
    }))

    const totalValue = itens.reduce((s, i) => s + i.total, 0)

    return new Orcamento(
      {
        clienteId: data.clienteId,
        animalId: data.animalId,
        data: data.data ?? new Date(),
        validade: data.validade,
        status,
        motivoPerda: data.motivoPerda,
        total: Money.create(totalValue),
        obs: data.obs,
        vendaId: data.vendaId,
        formasPag: data.formasPag ?? [],
        descontoRecompraAplicado: data.descontoRecompraAplicado ?? false,
        valorDescontoRecompra: data.valorDescontoRecompra,
        itens,
      },
      data.id,
    )
  }

  get clienteId(): string | undefined { return this.props.clienteId }
  get animalId(): string | undefined { return this.props.animalId }
  get data(): Date { return this.props.data }
  get validade(): Date { return this.props.validade }
  get status(): OrcamentoStatus { return this.props.status }
  get motivoPerda(): MotivoPerda | undefined { return this.props.motivoPerda }
  get total(): number { return this.props.total.value }
  get obs(): string | undefined { return this.props.obs }
  get vendaId(): string | undefined { return this.props.vendaId }
  get formasPag(): string[] { return this.props.formasPag }
  get descontoRecompraAplicado(): boolean { return this.props.descontoRecompraAplicado }
  get valorDescontoRecompra(): number | undefined { return this.props.valorDescontoRecompra }
  get itens(): OrcamentoItemReadOnly[] { return this.props.itens }

  get vencido(): boolean {
    if (this.props.status !== 'aberto') return false
    return this.props.validade < new Date()
  }

  fechar(): void {
    if (this.props.status !== 'aberto') {
      throw new ValidationError('INVALID_STATUS_TRANSITION', `Não é possível fechar orçamento com status: ${this.props.status}`)
    }
    this.props.status = 'fechado'
    this.updatedAt = new Date()
  }

  perder(motivo: MotivoPerda): void {
    if (this.props.status !== 'aberto') {
      throw new ValidationError('INVALID_STATUS_TRANSITION', `Não é possível marcar como perdido orçamento com status: ${this.props.status}`)
    }
    if (!motivo || !MOTIVOS_PERDA.includes(motivo)) {
      throw new ValidationError('MOTIVO_PERDA_INVALIDO', 'Motivo de perda inválido ou não informado')
    }
    this.props.status = 'perdido'
    this.props.motivoPerda = motivo
    this.updatedAt = new Date()
  }

  reabrir(): void {
    if (this.props.status !== 'perdido') {
      throw new ValidationError('INVALID_STATUS_TRANSITION', `Não é possível reabrir orçamento com status: ${this.props.status}`)
    }
    this.props.status = 'aberto'
    this.props.motivoPerda = undefined
    this.updatedAt = new Date()
  }

  vincularVenda(vendaId: string): void {
    this.props.vendaId = vendaId
    this.props.status = 'fechado'
    this.updatedAt = new Date()
  }

  update(fields: {
    validade?: Date
    obs?: string
    itens?: OrcamentoItemData[]
    descontoRecompraAplicado?: boolean
    valorDescontoRecompra?: number
  }): void {
    if (this.props.status !== 'aberto') {
      throw new ValidationError('VALIDATION_ERROR', 'Apenas orçamentos abertos podem ser editados')
    }
    if (fields.validade !== undefined) this.props.validade = fields.validade
    if (fields.obs !== undefined) this.props.obs = fields.obs
    if (fields.descontoRecompraAplicado !== undefined) this.props.descontoRecompraAplicado = fields.descontoRecompraAplicado
    if (fields.valorDescontoRecompra !== undefined) this.props.valorDescontoRecompra = fields.valorDescontoRecompra
    if (fields.itens !== undefined) {
      this.props.itens = fields.itens.map((item) => ({
        id: item.id ?? crypto.randomUUID(),
        produtoId: item.produtoId,
        nome: item.nome,
        qtd: item.qtd,
        valorUnitario: item.valorUnitario,
        desconto: item.desconto ?? 0,
        total: Math.max(0, Money.create(item.valorUnitario).multiply(item.qtd).value - (item.desconto ?? 0)),
      }))
      this.props.total = Money.create(this.props.itens.reduce((s, i) => s + i.total, 0))
    }
    this.updatedAt = new Date()
  }
}
