import { AggregateRoot } from '@/shared/domain/aggregate-root.base.js'
import { ValidationError } from '@/shared/errors/validation.error.js'

const ESPECIES_VALIDAS = ['Cão', 'Gato'] as const
const SEXOS_VALIDOS = ['M', 'F', 'Indefinido'] as const

type Especie = (typeof ESPECIES_VALIDAS)[number]
type Sexo = (typeof SEXOS_VALIDOS)[number]

interface AnimalProps {
  nome: string
  clienteId: string
  especie: Especie
  raca?: string
  sexo: Sexo
  nascimento?: Date
  peso: number
  obs?: string
  deletedAt?: Date
}

export class Animal extends AggregateRoot<AnimalProps> {
  static create(data: {
    id?: string
    nome: string
    clienteId: string
    especie: string
    raca?: string
    sexo?: string
    nascimento?: Date
    peso?: number
    obs?: string
    deletedAt?: Date
  }): Animal {
    if (!ESPECIES_VALIDAS.includes(data.especie as Especie)) {
      throw new ValidationError('VALIDATION_ERROR', `Espécie inválida: ${data.especie}. Use: ${ESPECIES_VALIDAS.join(', ')}`)
    }
    const sexo = (data.sexo ?? 'Indefinido') as Sexo
    if (!SEXOS_VALIDOS.includes(sexo)) {
      throw new ValidationError('VALIDATION_ERROR', `Sexo inválido: ${data.sexo}. Use: ${SEXOS_VALIDOS.join(', ')}`)
    }
    return new Animal(
      {
        nome: data.nome,
        clienteId: data.clienteId,
        especie: data.especie as Especie,
        raca: data.raca,
        sexo,
        nascimento: data.nascimento,
        peso: data.peso ?? 0,
        obs: data.obs,
        deletedAt: data.deletedAt,
      },
      data.id,
    )
  }

  get nome(): string { return this.props.nome }
  get clienteId(): string { return this.props.clienteId }
  get especie(): string { return this.props.especie }
  get raca(): string | undefined { return this.props.raca }
  get sexo(): string { return this.props.sexo }
  get nascimento(): Date | undefined { return this.props.nascimento }
  get peso(): number { return this.props.peso }
  get obs(): string | undefined { return this.props.obs }
  get deletedAt(): Date | undefined { return this.props.deletedAt }
  get isActive(): boolean { return !this.props.deletedAt }

  get idadeCalculada(): { anos: number; meses: number } | null {
    if (!this.props.nascimento) return null
    const now = new Date()
    const born = this.props.nascimento
    let anos = now.getFullYear() - born.getFullYear()
    let meses = now.getMonth() - born.getMonth()
    if (meses < 0) { anos -= 1; meses += 12 }
    if (now.getDate() < born.getDate()) { meses -= 1 }
    if (meses < 0) { anos -= 1; meses += 12 }
    return { anos, meses }
  }

  softDelete(): void {
    if (this.props.deletedAt) return
    this.props.deletedAt = new Date()
  }

  update(fields: Partial<Omit<AnimalProps, 'clienteId' | 'deletedAt'>>): void {
    if (fields.nome !== undefined) this.props.nome = fields.nome
    if (fields.especie !== undefined) {
      if (!ESPECIES_VALIDAS.includes(fields.especie as Especie)) {
        throw new ValidationError('VALIDATION_ERROR', `Espécie inválida: ${fields.especie}`)
      }
      this.props.especie = fields.especie as Especie
    }
    if (fields.sexo !== undefined) {
      if (!SEXOS_VALIDOS.includes(fields.sexo as Sexo)) {
        throw new ValidationError('VALIDATION_ERROR', `Sexo inválido: ${fields.sexo}`)
      }
      this.props.sexo = fields.sexo as Sexo
    }
    if (fields.raca !== undefined) this.props.raca = fields.raca
    if (fields.nascimento !== undefined) this.props.nascimento = fields.nascimento
    if (fields.peso !== undefined) this.props.peso = fields.peso
    if (fields.obs !== undefined) this.props.obs = fields.obs
    this.updatedAt = new Date()
  }
}
