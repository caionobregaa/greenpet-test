import bcrypt from 'bcryptjs'
import { ValidationError } from '@/shared/errors/validation.error.js'

export class Password {
  private constructor(private readonly _hash: string) {}

  get hash(): string {
    return this._hash
  }

  static validate(raw: string): void {
    if (raw.length < 8) {
      throw new ValidationError('WEAK_PASSWORD', 'Senha deve ter no mínimo 8 caracteres')
    }
    if (!/[a-zA-Z]/.test(raw)) {
      throw new ValidationError('WEAK_PASSWORD', 'Senha deve conter pelo menos 1 letra')
    }
    if (!/\d/.test(raw)) {
      throw new ValidationError('WEAK_PASSWORD', 'Senha deve conter pelo menos 1 número')
    }
  }

  static async hash(raw: string, rounds = 12): Promise<string> {
    Password.validate(raw)
    return bcrypt.hash(raw, rounds)
  }

  static fromHash(hash: string): Password {
    return new Password(hash)
  }

  async compare(raw: string): Promise<boolean> {
    return bcrypt.compare(raw, this._hash)
  }
}
