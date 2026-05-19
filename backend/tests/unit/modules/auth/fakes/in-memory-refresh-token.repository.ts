import type { IRefreshTokenRepository } from '@/modules/auth/domain/repositories/refresh-token.repository.interface'

interface StoredToken {
  id: string
  token: string
  userId: string
  expiresAt: Date
  usedAt?: Date
}

export class InMemoryRefreshTokenRepository implements IRefreshTokenRepository {
  public items: StoredToken[] = []

  async create(data: {
    token: string
    userId: string
    expiresAt: Date
  }): Promise<void> {
    this.items.push({
      id: crypto.randomUUID(),
      token: data.token,
      userId: data.userId,
      expiresAt: data.expiresAt,
    })
  }

  async findByToken(token: string): Promise<StoredToken | null> {
    return this.items.find((t) => t.token === token) ?? null
  }

  async markAsUsed(token: string): Promise<void> {
    const t = this.items.find((i) => i.token === token)
    if (t) t.usedAt = new Date()
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.items = this.items.filter((t) => t.userId !== userId)
  }
}
