import { AggregateRoot } from '@/shared/domain/aggregate-root.base.js'
import { Money } from '@/shared/domain/value-objects/money.vo.js'
import { ValidationError } from '@/shared/errors/validation.error.js'

const FORMAS_PAGAMENTO = ['Pix', 'Dinheiro', 'Cartão Crédito', 'Cartão Débito', 'Boleto'] as const
type FormaPag = (typeof FORMAS_PAGAMENTO)[number]

export interface VendaItemData {
  id?: string
  produtoId?: string
  nome: string
  qtd: number
  valorUnitario: number
  desconto?: number
  itemAnimalId?: string
  consumoDiario?: number
  recompraData?: Date
  brinde?: boolean
}

export interface VendaItemReadOnly {
  id: string
  produtoId?: string
  nome: string
  qtd: number
  valorUnitario: number
  desconto: number
  total: number
  itemAnimalId?: string
  consumoDiario?: number
  recompraData?: Date
  brinde: boolean
}

/** Recebimento posterior de parte do valor em aberto (specs/vendas/spec-v6.md). */
export interface VendaPagamento {
  id: string
  valor: number
  data: Date
  formaPag: FormaPag
  obs?: string
}

const centavos = (v: number) => Math.round(v * 100) / 100

interface VendaProps {
  numero?: number
  clienteId: string
  animalId?: string
  data: Date
  formaPag: FormaPag
  taxaCartao: number
  taxaEntrega: number
  desconto: number
  total: Money
  obs?: string
  itens: VendaItemReadOnly[]
  /** Valor pago no ato. Vazio = pago por inteiro (acompanha o total). */
  valorRecebido?: number
  pagamentos: VendaPagamento[]
}

export class Venda extends AggregateRoot<VendaProps> {
  static create(data: {
    id?: string
    numero?: number
    clienteId: string
    animalId?: string
    data?: Date
    formaPag: string
    taxaCartao?: number
    taxaEntrega?: number
    desconto?: number
    obs?: string
    itens: VendaItemData[]
    /** Pago no ato. Sem informar, a venda é paga por inteiro. */
    valorRecebido?: number
    pagamentos?: Array<{ id?: string; valor: number; data: Date; formaPag: string; obs?: string }>
  }): Venda {
    if (!FORMAS_PAGAMENTO.includes(data.formaPag as FormaPag)) {
      throw new ValidationError('VALIDATION_ERROR', `Forma de pagamento inválida: ${data.formaPag}. Use: ${FORMAS_PAGAMENTO.join(', ')}`)
    }
    if (!data.itens || data.itens.length === 0) {
      throw new ValidationError('VALIDATION_ERROR', 'Venda deve ter ao menos 1 item')
    }

    const itens: VendaItemReadOnly[] = data.itens.map((item) => {
      if (item.qtd <= 0) {
        throw new ValidationError('VALIDATION_ERROR', 'Quantidade deve ser maior que zero')
      }
      // Brinde tem valor final zerado: não é cobrado nem conta como desconto (specs/vendas/spec-v5.md)
      const brinde = item.brinde ?? false
      const valorUnitario = brinde ? 0 : item.valorUnitario
      const itemDesconto = brinde ? 0 : (item.desconto ?? 0)
      const itemTotal = Math.max(0, Money.create(valorUnitario).multiply(item.qtd).value - itemDesconto)
      return {
        id: item.id ?? crypto.randomUUID(),
        produtoId: item.produtoId,
        nome: item.nome,
        qtd: item.qtd,
        valorUnitario,
        desconto: itemDesconto,
        total: itemTotal,
        itemAnimalId: item.itemAnimalId,
        consumoDiario: item.consumoDiario,
        recompraData: item.recompraData,
        brinde,
      }
    })

    const entrega = data.taxaEntrega ?? 0
    const desconto = data.desconto ?? 0
    const totalValue = Math.max(0, itens.reduce((sum, i) => sum + i.total, 0) + entrega - desconto)
    const total = Money.create(totalValue)

    const valorRecebido = data.valorRecebido
    if (valorRecebido !== undefined && !(valorRecebido >= 0)) {
      throw new ValidationError('VALIDATION_ERROR', 'Valor recebido não pode ser negativo')
    }

    return new Venda(
      {
        numero: data.numero,
        clienteId: data.clienteId,
        animalId: data.animalId,
        data: data.data ?? new Date(),
        formaPag: data.formaPag as FormaPag,
        taxaCartao: data.taxaCartao ?? 0,
        taxaEntrega: entrega,
        desconto,
        total,
        obs: data.obs,
        itens,
        valorRecebido: valorRecebido === undefined ? undefined : centavos(valorRecebido),
        pagamentos: (data.pagamentos ?? []).map((p) => Venda.novoPagamento(p)),
      },
      data.id,
    )
  }

  get numero(): number | undefined { return this.props.numero }
  get clienteId(): string { return this.props.clienteId }
  get animalId(): string | undefined { return this.props.animalId }
  get data(): Date { return this.props.data }
  get formaPag(): string { return this.props.formaPag }
  get taxaCartao(): number { return this.props.taxaCartao }
  get taxaEntrega(): number { return this.props.taxaEntrega }
  get desconto(): number { return this.props.desconto }
  get total(): number { return this.props.total.value }
  get obs(): string | undefined { return this.props.obs }
  get itens(): VendaItemReadOnly[] { return this.props.itens }
  /** Pago no ato da venda. */
  get valorRecebido(): number { return this.props.valorRecebido ?? this.total }
  /** O que foi gravado: vazio quando a venda foi paga por inteiro. */
  get valorRecebidoInformado(): number | undefined { return this.props.valorRecebido }
  get pagamentos(): VendaPagamento[] { return this.props.pagamentos }

  /** Pago no ato + recebimentos posteriores. */
  get valorPago(): number {
    return centavos(this.valorRecebido + this.props.pagamentos.reduce((s, p) => s + p.valor, 0))
  }

  /** O que o cliente ainda deve (nunca negativo). */
  get valorEmAberto(): number {
    return Math.max(0, centavos(this.total - this.valorPago))
  }

  /** Na criação, o valor pago no ato não pode passar do total. */
  assertValorRecebidoValido(): void {
    if (this.valorRecebido > this.total) {
      throw new ValidationError('VALIDATION_ERROR', 'Valor recebido não pode ser maior que o total da venda')
    }
  }

  registrarPagamento(input: { valor: number; data?: Date; formaPag: string; obs?: string }): VendaPagamento {
    if (!(input.valor > 0)) {
      throw new ValidationError('VALIDATION_ERROR', 'Valor do recebimento deve ser maior que zero')
    }
    if (centavos(input.valor) > this.valorEmAberto) {
      throw new ValidationError('VALIDATION_ERROR', 'Valor do recebimento é maior que o valor em aberto')
    }
    const pagamento = Venda.novoPagamento({ ...input, data: input.data ?? new Date() })
    this.props.pagamentos.push(pagamento)
    return pagamento
  }

  /** Retorna false se o recebimento não existe nesta venda. */
  removerPagamento(pagamentoId: string): boolean {
    const antes = this.props.pagamentos.length
    this.props.pagamentos = this.props.pagamentos.filter((p) => p.id !== pagamentoId)
    return this.props.pagamentos.length < antes
  }

  private static novoPagamento(p: { id?: string; valor: number; data: Date; formaPag: string; obs?: string }): VendaPagamento {
    if (!FORMAS_PAGAMENTO.includes(p.formaPag as FormaPag)) {
      throw new ValidationError('VALIDATION_ERROR', `Forma de pagamento inválida: ${p.formaPag}. Use: ${FORMAS_PAGAMENTO.join(', ')}`)
    }
    return { id: p.id ?? crypto.randomUUID(), valor: centavos(p.valor), data: p.data, formaPag: p.formaPag as FormaPag, obs: p.obs }
  }
}
