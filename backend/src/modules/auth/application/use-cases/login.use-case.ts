import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js'
import type { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface.js'
import { Password } from '../../domain/value-objects/password.vo.js'
import { UnauthorizedError } from '@/shared/errors/unauthorized.error.js'

export interface IJwtService {
  sign(payload: Record<string, unknown>, expiresIn: number): string
}

export interface LoginInput {
  email: string
  password: string
}

export interface LoginOutput {
  token: string
  refreshToken: string
  expiresIn: number
  user: {
    id: string
    nome: string
    email: string
    papel: string
  }
}

export class LoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly refreshRepo: IRefreshTokenRepository,
    private readonly jwtService: IJwtService,
    private readonly jwtExpiresIn: number,
    private readonly refreshExpiresInDays: number,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepo.findByEmail(input.email)

    if (!user) {
      throw new UnauthorizedError('INVALID_CREDENTIALS', 'E-mail ou senha inválidos')
    }

    if (user.isLocked) {
      throw new UnauthorizedError('ACCOUNT_LOCKED', 'Conta bloqueada. Tente novamente mais tarde.')
    }

    const pwd = Password.fromHash(user.senhaHash)
    const valid = await pwd.compare(input.password)

    if (!valid) {
      user.recordFailedLogin()
      await this.userRepo.save(user)
      throw new UnauthorizedError('INVALID_CREDENTIALS', 'E-mail ou senha inválidos')
    }

    user.resetLoginAttempts()
    await this.userRepo.save(user)

    const token = this.jwtService.sign(
      { sub: user.id, email: user.email, papel: user.papel },
      this.jwtExpiresIn,
    )

    const refreshToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + this.refreshExpiresInDays)

    await this.refreshRepo.create({ token: refreshToken, userId: user.id, expiresAt })

    return {
      token,
      refreshToken,
      expiresIn: this.jwtExpiresIn,
      user: { id: user.id, nome: user.nome, email: user.email, papel: user.papel },
    }
  }
}
