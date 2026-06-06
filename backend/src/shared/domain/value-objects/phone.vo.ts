import { ValueObject } from '../value-object.base.js'
import { ValidationError } from '../../errors/validation.error.js'

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
    const digits = raw.replace(/\D/g, '')
    let formatted = raw
    if (digits.length === 11) {
      formatted = `(${digits.slice(0, 2)}) ${digits[2]} ${digits.slice(3, 7)}-${digits.slice(7)}`
    } else if (digits.length === 10) {
      formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
    }
    if (!CELULAR.test(formatted) && !FIXO.test(formatted)) {
      throw new ValidationError('VALIDATION_ERROR', 'Telefone inválido: use o formato (99) 9 9999-9999 ou (99) 9999-9999')
    }
    return new Phone({ value: formatted })
  }

  /** Reconstitui a partir do banco sem validação — aceita qualquer formato já armazenado. */
  static fromRaw(value: string): Phone {
    return new Phone({ value: value.trim() })
  }

  toString(): string {
    return this.props.value
  }
}
