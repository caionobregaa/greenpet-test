import { AggregateRoot } from '@/shared/domain/aggregate-root.base.js'
import { Money } from '@/shared/domain/value-objects/money.vo.js'
import { ValidationError } from '@/shared/errors/validation.error.js'

export type CompraStatus = 'pendente' | 'confirmado' | 'recebido' | 'cancelado'

export interface CompraItemData {
  id?: string
  produtoId?: string
  nome: string
  qtd: number
  valorUnitario: number
}

export interface CompraItemReadOnly {
  id: string
  produtoId?: string
  nome: string
  qtd: number
  valorUnitario: number
  total: number
}

interface CompraProps {
  fornecedor: string
  dataPedido: Date
  dataRecebimento?: Date
  categoria: string
  descricaoSimples?: string
  status: CompraStatus
  total: Money
  obs?: string
  itens: CompraItemReadOnly[]
}

export class Compra extends AggregateRoot<CompraProps> {
  static create(data: {
    id?: string
    fornecedor: string
    dataPedido?: Date
    dataRecebimento?: Date
    categoria?: string
    descricaoSimples?: string
    status?: CompraStatus
    obs?: string
    itens: CompraItemData[]
    totalManual?: number
  }): Compra {
    const itens: CompraItemReadOnly[] = data.itens.map((item) => ({
      id: item.id ?? crypto.randomUUID(),
      produtoId: item.produtoId,
      nome: item.nome,
      qtd: item.qtd,
      valorUnitario: item.valorUnitario,
      total: Money.create(item.valorUnitario).multiply(item.qtd).value,
    }))

    const totalValue = itens.length > 0
      ? itens.reduce((s, i) => s + i.total, 0)
      : (data.totalManual ?? 0)

    return new Compra(
      {
        fornecedor: data.fornecedor,
        dataPedido: data.dataPedido ?? new Date(),
        dataRecebimento: data.dataRecebimento,
        categoria: data.categoria ?? 'Produtos Pets',
        descricaoSimples: data.descricaoSimples,
        status: data.status ?? 'pendente',
        total: Money.create(totalValue),
        obs: data.obs,
        itens,
      },
      data.id,
    )
  }

  get fornecedor(): string { return this.props.fornecedor }
  get dataPedido(): Date { return this.props.dataPedido }
  get dataRecebimento(): Date | undefined { return this.props.dataRecebimento }
  get categoria(): string { return this.props.categoria }
  get descricaoSimples(): string | undefined { return this.props.descricaoSimples }
  get status(): CompraStatus { return this.props.status }
  get total(): number { return this.props.total.value }
  get obs(): string | undefined { return this.props.obs }
  get itens(): CompraItemReadOnly[] { return this.props.itens }

  assertEditavel(): void {
    if (this.props.status === 'confirmado' || this.props.status === 'recebido' || this.props.status === 'cancelado') {
      throw new ValidationError('CANNOT_EDIT', `Compra com status '${this.props.status}' não pode ser editada`)
    }
  }

  confirmar(): void {
    if (this.props.status !== 'pendente') {
      throw new ValidationError('INVALID_STATUS_TRANSITION', `Não é possível confirmar compra com status: ${this.props.status}`)
    }
    this.props.status = 'confirmado'
    this.updatedAt = new Date()
  }

  receber(): void {
    if (this.props.status !== 'confirmado') {
      throw new ValidationError('INVALID_STATUS_TRANSITION', `Não é possível receber compra com status: ${this.props.status}`)
    }
    this.props.status = 'recebido'
    this.props.dataRecebimento = new Date()
    this.updatedAt = new Date()
  }

  cancelar(): void {
    if (this.props.status !== 'pendente') {
      throw new ValidationError('INVALID_STATUS_TRANSITION', `Não é possível cancelar compra com status: ${this.props.status}`)
    }
    this.props.status = 'cancelado'
    this.updatedAt = new Date()
  }

  update(fields: { fornecedor?: string; obs?: string; dataPedido?: Date; categoria?: string; descricaoSimples?: string; totalManual?: number; itens?: CompraItemData[] }): void {
    this.assertEditavel()
    if (fields.fornecedor !== undefined) this.props.fornecedor = fields.fornecedor
    if (fields.obs !== undefined) this.props.obs = fields.obs
    if (fields.dataPedido !== undefined) this.props.dataPedido = fields.dataPedido
    if (fields.categoria !== undefined) this.props.categoria = fields.categoria
    if (fields.descricaoSimples !== undefined) this.props.descricaoSimples = fields.descricaoSimples
    if (fields.totalManual !== undefined && (fields.itens === undefined || fields.itens.length === 0)) {
      this.props.total = Money.create(fields.totalManual)
    }
    if (fields.itens !== undefined) {
      this.props.itens = fields.itens.map((item) => ({
        id: item.id ?? crypto.randomUUID(),
        produtoId: item.produtoId,
        nome: item.nome,
        qtd: item.qtd,
        valorUnitario: item.valorUnitario,
        total: Money.create(item.valorUnitario).multiply(item.qtd).value,
      }))
      this.props.total = Money.create(this.props.itens.reduce((s, i) => s + i.total, 0))
    }
    this.updatedAt = new Date()
  }
}
