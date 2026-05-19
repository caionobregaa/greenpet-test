import type { PrismaClient } from '@prisma/client'
import type { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface.js'

export class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: { token: string; userId: string; expiresAt: Date }): Promise<void> {
    await this.prisma.refreshToken.create({
      data: { token: data.token, userId: data.userId, expiresAt: data.expiresAt },
    })
  }

  async findByToken(token: string) {
    const row = await this.prisma.refreshToken.findUnique({ where: { token } })
    if (!row) return null
    return {
      id: row.id,
      token: row.token,
      userId: row.userId,
      expiresAt: row.expiresAt,
      usedAt: row.usedAt ?? undefined,
    }
  }

  async markAsUsed(token: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { token },
      data: { usedAt: new Date() },
    })
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } })
  }
}
