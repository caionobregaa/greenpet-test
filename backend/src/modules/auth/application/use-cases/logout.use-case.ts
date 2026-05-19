import type { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface.js'

export class LogoutUseCase {
  constructor(private readonly refreshRepo: IRefreshTokenRepository) {}

  async execute(userId: string): Promise<void> {
    await this.refreshRepo.deleteByUserId(userId)
  }
}
