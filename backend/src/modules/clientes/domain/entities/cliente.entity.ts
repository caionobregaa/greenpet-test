import { AggregateRoot } from '@/shared/domain/aggregate-root.base.js'
import { CPF } from '@/shared/domain/value-objects/cpf.vo.js'
import { Email } from '@/shared/domain/value-objects/email.vo.js'
import { Phone } from '@/shared/domain/value-objects/phone.vo.js'
import { ValidationError } from '@/shared/errors/validation.error.js'

interface ClienteProps {
  nome: string
  telefone: Phone
  email?: Email
  cpf?: CPF
  endereco?: string
  bairro?: string
  cidade: string
  obs?: string
  deletedAt?: Date
  numeroDeAnimais?: number
}

export class Cliente extends AggregateRoot<ClienteProps> {
  static create(data: {
    id?: string
    nome: string
    telefone: string
    email?: string
    cpf?: string
    endereco?: string
    bairro?: string
    cidade?: string
    obs?: string
    deletedAt?: Date
    numeroDeAnimais?: number
  }): Cliente {
    if (!data.nome || data.nome.trim().length < 3) {
      throw new ValidationError('VALIDATION_ERROR', 'Nome deve ter ao menos 3 caracteres')
    }
    return new Cliente(
      {
        nome: data.nome.trim(),
        telefone: Phone.create(data.telefone),
        email: data.email ? Email.create(data.email) : undefined,
        cpf: data.cpf ? CPF.create(data.cpf) : undefined,
        endereco: data.endereco,
        bairro: data.bairro,
        cidade: data.cidade ?? 'Manaus',
        obs: data.obs,
        deletedAt: data.deletedAt,
        numeroDeAnimais: data.numeroDeAnimais,
      },
      data.id,
    )
  }

  get nome(): string { return this.props.nome }
  get telefone(): string { return this.props.telefone.value }
  get email(): string | undefined { return this.props.email?.value }
  get cpf(): string | undefined { return this.props.cpf?.value }
  get endereco(): string | undefined { return this.props.endereco }
  get bairro(): string | undefined { return this.props.bairro }
  get cidade(): string { return this.props.cidade }
  get obs(): string | undefined { return this.props.obs }
  get deletedAt(): Date | undefined { return this.props.deletedAt }
  get isActive(): boolean { return !this.props.deletedAt }
  get numeroDeAnimais(): number { return this.props.numeroDeAnimais ?? 0 }

  update(fields: {
    nome?: string
    telefone?: string
    email?: string
    cpf?: string
    endereco?: string
    bairro?: string
    cidade?: string
    obs?: string
  }): void {
    if (fields.nome !== undefined) {
      if (fields.nome.trim().length < 3) {
        throw new ValidationError('VALIDATION_ERROR', 'Nome deve ter ao menos 3 caracteres')
      }
      this.props.nome = fields.nome.trim()
    }
    if (fields.telefone !== undefined) this.props.telefone = Phone.create(fields.telefone)
    if (fields.email !== undefined) this.props.email = Email.create(fields.email)
    if (fields.cpf !== undefined) this.props.cpf = CPF.create(fields.cpf)
    if (fields.endereco !== undefined) this.props.endereco = fields.endereco
    if (fields.bairro !== undefined) this.props.bairro = fields.bairro
    if (fields.cidade !== undefined) this.props.cidade = fields.cidade
    if (fields.obs !== undefined) this.props.obs = fields.obs
    this.updatedAt = new Date()
  }

  softDelete(): void {
    if (this.props.deletedAt) return
    this.props.deletedAt = new Date()
  }
}
