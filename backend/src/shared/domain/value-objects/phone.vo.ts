import { ValueObject } from '../value-object.base.js'

interface PhoneProps {
  value: string
}

const CELULAR = /^\(\d{2}\) \d \d{4}-\d{4}$/
const FIXO = /^\(\d{2}\) \d{4}-\d{4}$/

export class Phone extends ValueObject<PhoneProps> {
  get value(): string {
    return this.props.value
  }

  static create(raw: string): Phone {
    if (!CELULAR.test(raw) && !FIXO.test(raw)) {
      throw new Error('Telefone inválido: use o formato (99) 9 9999-9999 ou (99) 9999-9999')
    }
    return new Phone({ value: raw })
  }

  toString(): string {
    return this.props.value
  }
}
