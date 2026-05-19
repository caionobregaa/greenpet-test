export interface IRefreshTokenRepository {
  create(data: { token: string; userId: string; expiresAt: Date }): Promise<void>
  findByToken(token: string): Promise<{
    id: string
    token: string
    userId: string
    expiresAt: Date
    usedAt?: Date
  } | null>
  markAsUsed(token: string): Promise<void>
  deleteByUserId(userId: string): Promise<void>
}
