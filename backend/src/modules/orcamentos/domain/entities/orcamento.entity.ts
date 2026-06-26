import { AggregateRoot } from '@/shared/domain/aggregate-root.base.js'
import { Money } from '@/shared/domain/value-objects/money.vo.js'
import { ValidationError } from '@/shared/errors/validation.error.js'

export type OrcamentoStatus = 'pendente' | 'aprovado' | 'recusado'

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
  total: Money
  obs?: string
  vendaId?: string
  formasPag: string[]
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
    obs?: string
    vendaId?: string
    formasPag?: string[]
    itens: OrcamentoItemData[]
  }): Orcamento {
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
        status: data.status ?? 'pendente',
        total: Money.create(totalValue),
        obs: data.obs,
        vendaId: data.vendaId,
        formasPag: data.formasPag ?? [],
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
  get total(): number { return this.props.total.value }
  get obs(): string | undefined { return this.props.obs }
  get vendaId(): string | undefined { return this.props.vendaId }
  get formasPag(): string[] { return this.props.formasPag }
  get itens(): OrcamentoItemReadOnly[] { return this.props.itens }

  get vencido(): boolean {
    if (this.props.status !== 'pendente') return false
    return this.props.validade < new Date()
  }

  aprovar(): void {
    if (this.props.status !== 'pendente') {
      throw new ValidationError('INVALID_STATUS_TRANSITION', `Não é possível aprovar orçamento com status: ${this.props.status}`)
    }
    this.props.status = 'aprovado'
    this.updatedAt = new Date()
  }

  recusar(): void {
    if (this.props.status !== 'pendente') {
      throw new ValidationError('INVALID_STATUS_TRANSITION', `Não é possível recusar orçamento com status: ${this.props.status}`)
    }
    this.props.status = 'recusado'
    this.updatedAt = new Date()
  }

  reabrir(): void {
    if (this.props.status !== 'recusado') {
      throw new ValidationError('INVALID_STATUS_TRANSITION', `Não é possível reabrir orçamento com status: ${this.props.status}`)
    }
    this.props.status = 'pendente'
    this.updatedAt = new Date()
  }

  vincularVenda(vendaId: string): void {
    this.props.vendaId = vendaId
    this.props.status = 'aprovado'
    this.updatedAt = new Date()
  }

  update(fields: {
    validade?: Date
    obs?: string
    itens?: OrcamentoItemData[]
  }): void {
    if (this.props.status !== 'pendente') {
      throw new ValidationError('VALIDATION_ERROR', 'Apenas orçamentos pendentes podem ser editados')
    }
    if (fields.validade !== undefined) this.props.validade = fields.validade
    if (fields.obs !== undefined) this.props.obs = fields.obs
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
