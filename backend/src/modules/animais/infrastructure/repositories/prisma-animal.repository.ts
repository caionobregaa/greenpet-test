import type { PrismaClient } from '@prisma/client'
import type { IAnimalRepository } from '../../domain/repositories/animal.repository.interface.js'
import { Animal } from '../../domain/entities/animal.entity.js'

export class PrismaAnimalRepository implements IAnimalRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Animal | null> {
    const row = await this.prisma.animal.findFirst({ where: { id, deletedAt: null } })
    return row ? this.toDomain(row) : null
  }

  async findMany(params: { clienteId?: string; page: number; limit: number }) {
    const where = {
      deletedAt: null,
      ...(params.clienteId ? { clienteId: params.clienteId } : {}),
    }
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.animal.findMany({
        where,
        include: { cliente: { select: { nome: true } } },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.animal.count({ where }),
    ])
    const clienteNomes: Record<string, string> = {}
    rows.forEach((r) => { clienteNomes[r.id] = r.cliente?.nome ?? '' })
    return { animais: rows.map((r) => this.toDomain(r)), clienteNomes, total }
  }

  async save(animal: Animal): Promise<void> {
    const data = {
      nome: animal.nome,
      clienteId: animal.clienteId,
      especie: animal.especie,
      raca: animal.raca ?? null,
      sexo: animal.sexo,
      nascimento: animal.nascimento ?? null,
      peso: animal.peso,
      obs: animal.obs ?? null,
      deletedAt: animal.deletedAt ?? null,
    }
    await this.prisma.animal.upsert({
      where: { id: animal.id },
      create: { id: animal.id, ...data },
      update: data,
    })
  }

  private toDomain(row: {
    id: string
    nome: string
    clienteId: string
    especie: string
    raca: string | null
    sexo: string
    nascimento: Date | null
    peso: unknown
    obs: string | null
    deletedAt: Date | null
  }): Animal {
    return Animal.create({
      id: row.id,
      nome: row.nome,
      clienteId: row.clienteId,
      especie: row.especie,
      raca: row.raca ?? undefined,
      sexo: row.sexo,
      nascimento: row.nascimento ?? undefined,
      peso: Number(row.peso),
      obs: row.obs ?? undefined,
      deletedAt: row.deletedAt ?? undefined,
    })
  }
}
