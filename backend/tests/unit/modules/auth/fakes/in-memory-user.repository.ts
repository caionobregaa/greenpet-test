import type { IUserRepository } from '@/modules/auth/domain/repositories/user.repository.interface'
import { User } from '@/modules/auth/domain/entities/user.entity'

export class InMemoryUserRepository implements IUserRepository {
  public items: User[] = []

  async findById(id: string): Promise<User | null> {
    return this.items.find((u) => u.id === id) ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.items.find((u) => u.email === email) ?? null
  }

  async save(user: User): Promise<void> {
    const idx = this.items.findIndex((u) => u.id === user.id)
    if (idx >= 0) this.items[idx] = user
    else this.items.push(user)
  }
}
