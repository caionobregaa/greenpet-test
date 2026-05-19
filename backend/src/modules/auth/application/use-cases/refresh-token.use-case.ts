import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js'
import type { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface.js'
import type { IJwtService } from './login.use-case.js'
import { UnauthorizedError } from '@/shared/errors/unauthorized.error.js'

export interface RefreshTokenOutput {
  token: string
  refreshToken: string
  expiresIn: number
}

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly refreshRepo: IRefreshTokenRepository,
    private readonly jwtService: IJwtService,
    private readonly jwtExpiresIn: number,
    private readonly refreshExpiresInDays: number,
  ) {}

  async execute(token: string): Promise<RefreshTokenOutput> {
    const stored = await this.refreshRepo.findByToken(token)

    if (!stored) {
      throw new UnauthorizedError('INVALID_REFRESH_TOKEN', 'Refresh token inválido')
    }

    if (stored.usedAt) {
      throw new UnauthorizedError('REFRESH_TOKEN_USED', 'Refresh token já utilizado')
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedError('REFRESH_TOKEN_EXPIRED', 'Refresh token expirado')
    }

    const user = await this.userRepo.findById(stored.userId)
    if (!user) {
      throw new UnauthorizedError('INVALID_REFRESH_TOKEN', 'Refresh token inválido')
    }

    await this.refreshRepo.markAsUsed(token)

    const newToken = this.jwtService.sign(
      { sub: user.id, email: user.email, papel: user.papel },
      this.jwtExpiresIn,
    )

    const newRefreshToken = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + this.refreshExpiresInDays)

    await this.refreshRepo.create({
      token: newRefreshToken,
      userId: user.id,
      expiresAt,
    })

    return { token: newToken, refreshToken: newRefreshToken, expiresIn: this.jwtExpiresIn }
  }
}
