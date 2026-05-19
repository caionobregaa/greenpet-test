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
}

export interface VendaItemReadOnly {
  id: string
  produtoId?: string
  nome: string
  qtd: number
  valorUnitario: number
  total: number
}

interface VendaProps {
  clienteId: string
  animalId?: string
  data: Date
  formaPag: FormaPag
  total: Money
  obs?: string
  itens: VendaItemReadOnly[]
}

export class Venda extends AggregateRoot<VendaProps> {
  static create(data: {
    id?: string
    clienteId: string
    animalId?: string
    data?: Date
    formaPag: string
    obs?: string
    itens: VendaItemData[]
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
      const itemTotal = Money.create(item.valorUnitario).multiply(item.qtd).value
      return {
        id: item.id ?? crypto.randomUUID(),
        produtoId: item.produtoId,
        nome: item.nome,
        qtd: item.qtd,
        valorUnitario: item.valorUnitario,
        total: itemTotal,
      }
    })

    const totalValue = itens.reduce((sum, i) => sum + i.total, 0)

    return new Venda(
      {
        clienteId: data.clienteId,
        animalId: data.animalId,
        data: data.data ?? new Date(),
        formaPag: data.formaPag as FormaPag,
        total: Money.create(totalValue),
        obs: data.obs,
        itens,
      },
      data.id,
    )
  }

  get clienteId(): string { return this.props.clienteId }
  get animalId(): string | undefined { return this.props.animalId }
  get data(): Date { return this.props.data }
  get formaPag(): string { return this.props.formaPag }
  get total(): number { return this.props.total.value }
  get obs(): string | undefined { return this.props.obs }
  get itens(): VendaItemReadOnly[] { return this.props.itens }
}
