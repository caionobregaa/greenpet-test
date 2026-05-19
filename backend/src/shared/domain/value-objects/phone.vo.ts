import { ValueObject } from '../value-object.base.js'

interface PhoneProps {
  value: string
}

function formatPhone(digits: string): string {
  // digits must be exactly 11: DD + 9 + 8 digits
  return `(${digits.slice(0, 2)}) ${digits[2]} ${digits.slice(3, 7)}-${digits.slice(7)}`
}

export class Phone extends ValueObject<PhoneProps> {
  get value(): string {
    return this.props.value
  }

  static create(raw: string): Phone {
    const digits = raw.replace(/\D/g, '')
    if (digits.length !== 11) {
      throw new Error(`Telefone inválido: informe exatamente 11 dígitos`)
    }
    return new Phone({ value: formatPhone(digits) })
  }

  toString(): string {
    return this.props.value
  }
}
