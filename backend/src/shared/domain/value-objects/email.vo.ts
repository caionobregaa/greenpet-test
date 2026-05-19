import { ValueObject } from '../value-object.base.js'

interface EmailProps {
  value: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class Email extends ValueObject<EmailProps> {
  get value(): string {
    return this.props.value
  }

  static create(raw: string): Email {
    const trimmed = raw.trim().toLowerCase()
    if (!EMAIL_REGEX.test(trimmed)) {
      throw new Error(`E-mail inválido: ${raw}`)
    }
    return new Email({ value: trimmed })
  }

  toString(): string {
    return this.props.value
  }
}
