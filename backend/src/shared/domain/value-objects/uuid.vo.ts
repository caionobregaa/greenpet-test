import { ValueObject } from '../value-object.base.js'

interface UUIDProps {
  value: string
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export class UUID extends ValueObject<UUIDProps> {
  get value(): string {
    return this.props.value
  }

  static create(value?: string): UUID {
    const id = value ?? crypto.randomUUID()
    if (!UUID_REGEX.test(id)) {
      throw new Error(`UUID inválido: ${id}`)
    }
    return new UUID({ value: id })
  }

  toString(): string {
    return this.props.value
  }
}
