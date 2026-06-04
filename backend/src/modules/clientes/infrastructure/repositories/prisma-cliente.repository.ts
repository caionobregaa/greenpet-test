import type { PrismaClient } from '@prisma/client'
import type { IClienteRepository } from '../../domain/repositories/cliente.repository.interface.js'
import { Cliente } from '../../domain/entities/cliente.entity.js'

export class PrismaClienteRepository implements IClienteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Cliente | null> {
    const row = await this.prisma.cliente.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { animais: { where: { deletedAt: null } } } } },
    })
    return row ? this.toDomain(row) : null
  }

  async findByEmail(email: string): Promise<Cliente | null> {
    const row = await this.prisma.cliente.findFirst({ where: { email, deletedAt: null } })
    return row ? this.toDomain(row) : null
  }

  async findByCpf(cpf: string): Promise<Cliente | null> {
    const row = await this.prisma.cliente.findFirst({ where: { cpf, deletedAt: null } })
    return row ? this.toDomain(row) : null
  }

  async findMany(params: { q?: string; cidade?: string; page: number; limit: number }) {
    const where = {
      deletedAt: null,
      ...(params.cidade ? { cidade: params.cidade } : {}),
      ...(params.q
        ? { nome: { contains: params.q, mode: 'insensitive' as const } }
        : {}),
    }
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.cliente.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { nome: 'asc' },
        include: { _count: { select: { animais: { where: { deletedAt: null } } } } },
      }),
      this.prisma.cliente.count({ where }),
    ])
    return { clientes: rows.map((r) => this.toDomain(r)), total }
  }

  async save(cliente: Cliente): Promise<void> {
    const deleted = !!cliente.deletedAt
    const data = {
      nome: cliente.nome,
      telefone: cliente.telefone,
      // Limpa campos únicos ao deletar para liberar o índice
      email: deleted ? null : (cliente.email ?? null),
      cpf: deleted ? null : (cliente.cpf ?? null),
      endereco: cliente.endereco ?? null,
      bairro: cliente.bairro ?? null,
      cidade: cliente.cidade,
      obs: cliente.obs ?? null,
      deletedAt: cliente.deletedAt ?? null,
    }
    await this.prisma.cliente.upsert({
      where: { id: cliente.id },
      create: { id: cliente.id, ...data },
      update: data,
    })
  }

  async hasActiveSalesOrQuotes(clienteId: string): Promise<boolean> {
    const [vendas, orcamentos] = await this.prisma.$transaction([
      this.prisma.venda.count({ where: { clienteId } }),
      this.prisma.orcamento.count({ where: { clienteId, status: { not: 'recusado' } } }),
    ])
    return vendas > 0 || orcamentos > 0
  }

  private toDomain(row: {
    id: string
    nome: string
    telefone: string
    email: string | null
    cpf: string | null
    endereco: string | null
    bairro: string | null
    cidade: string
    obs: string | null
    deletedAt: Date | null
    _count?: { animais: number }
  }): Cliente {
    return Cliente.create({
      id: row.id,
      nome: row.nome,
      telefone: row.telefone,
      email: row.email ?? undefined,
      cpf: row.cpf ?? undefined,
      endereco: row.endereco ?? undefined,
      bairro: row.bairro ?? undefined,
      cidade: row.cidade,
      obs: row.obs ?? undefined,
      deletedAt: row.deletedAt ?? undefined,
      numeroDeAnimais: row._count?.animais ?? 0,
    })
  }
}
