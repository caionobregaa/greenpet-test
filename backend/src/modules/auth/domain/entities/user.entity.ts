import { AggregateRoot } from '@/shared/domain/aggregate-root.base.js'

const MAX_ATTEMPTS = 5
const LOCK_DURATION_MS = 15 * 60 * 1000

interface UserProps {
  nome: string
  email: string
  senhaHash: string
  papel: string
  loginAttempts: number
  lockedUntil?: Date
}

export class User extends AggregateRoot<UserProps> {
  static create(data: {
    id?: string
    nome: string
    email: string
    senhaHash: string
    papel?: string
    loginAttempts?: number
    lockedUntil?: Date
  }): User {
    return new User(
      {
        nome: data.nome,
        email: data.email,
        senhaHash: data.senhaHash,
        papel: data.papel ?? 'admin',
        loginAttempts: data.loginAttempts ?? 0,
        lockedUntil: data.lockedUntil,
      },
      data.id,
    )
  }

  get nome(): string { return this.props.nome }
  get email(): string { return this.props.email }
  get senhaHash(): string { return this.props.senhaHash }
  get papel(): string { return this.props.papel }
  get loginAttempts(): number { return this.props.loginAttempts }
  get lockedUntil(): Date | undefined { return this.props.lockedUntil }

  get isLocked(): boolean {
    if (!this.props.lockedUntil) return false
    return this.props.lockedUntil > new Date()
  }

  recordFailedLogin(): void {
    this.props.loginAttempts += 1
    if (this.props.loginAttempts >= MAX_ATTEMPTS) {
      this.props.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS)
    }
  }

  resetLoginAttempts(): void {
    this.props.loginAttempts = 0
    this.props.lockedUntil = undefined
  }
}
