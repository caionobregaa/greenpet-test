import type { PrismaClient } from '@prisma/client'
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js'
import { User } from '../../domain/entities/user.entity.js'

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } })
    return row ? this.toDomain(row) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email } })
    return row ? this.toDomain(row) : null
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        senhaHash: user.senhaHash,
        papel: user.papel,
        loginAttempts: user.loginAttempts,
        lockedUntil: user.lockedUntil ?? null,
      },
      update: {
        nome: user.nome,
        email: user.email,
        senhaHash: user.senhaHash,
        papel: user.papel,
        loginAttempts: user.loginAttempts,
        lockedUntil: user.lockedUntil ?? null,
      },
    })
  }

  private toDomain(row: {
    id: string
    nome: string
    email: string
    senhaHash: string
    papel: string
    loginAttempts: number
    lockedUntil: Date | null
  }): User {
    return User.create({
      id: row.id,
      nome: row.nome,
      email: row.email,
      senhaHash: row.senhaHash,
      papel: row.papel,
      loginAttempts: row.loginAttempts,
      lockedUntil: row.lockedUntil ?? undefined,
    })
  }
}
