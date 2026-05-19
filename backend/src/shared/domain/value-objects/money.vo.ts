import { ValueObject } from '../value-object.base.js'

interface MoneyProps {
  value: number
}

export class Money extends ValueObject<MoneyProps> {
  get value(): number {
    return this.props.value
  }

  static create(value: number): Money {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Valor monetário deve ser um número')
    }
    if (value < 0) {
      throw new Error('Valor monetário não pode ser negativo')
    }
    return new Money({ value: Math.round(value * 100) / 100 })
  }

  add(other: Money): Money {
    return Money.create(this.value + other.value)
  }

  multiply(qty: number): Money {
    return Money.create(this.value * qty)
  }

  toString(): string {
    return this.props.value.toFixed(2)
  }
}
