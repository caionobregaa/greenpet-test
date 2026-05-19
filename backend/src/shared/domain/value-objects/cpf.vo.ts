import { ValueObject } from '../value-object.base.js'

interface CPFProps {
  value: string
}

export class CPF extends ValueObject<CPFProps> {
  get value(): string {
    return this.props.value
  }

  static create(raw: string): CPF {
    const digits = raw.replace(/\D/g, '')
    if (digits.length !== 11) {
      throw new Error('CPF deve conter 11 dígitos')
    }
    if (!CPF.isValid(digits)) {
      throw new Error('CPF inválido')
    }
    const formatted = CPF.format(digits)
    return new CPF({ value: formatted })
  }

  private static isValid(digits: string): boolean {
    if (/^(\d)\1{10}$/.test(digits)) return false

    const calc = (factor: number): number => {
      let sum = 0
      for (let i = 0; i < factor - 1; i++) {
        sum += parseInt(digits[i]) * (factor - i)
      }
      const remainder = (sum * 10) % 11
      return remainder === 10 || remainder === 11 ? 0 : remainder
    }

    return calc(10) === parseInt(digits[9]) && calc(11) === parseInt(digits[10])
  }

  private static format(digits: string): string {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  toString(): string {
    return this.props.value
  }
}
