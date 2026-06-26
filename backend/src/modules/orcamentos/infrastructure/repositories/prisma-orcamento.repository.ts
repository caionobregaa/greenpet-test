import type { PrismaClient } from '@prisma/client'
import type { IOrcamentoRepository } from '../../domain/repositories/orcamento.repository.interface.js'
import { Orcamento, type OrcamentoStatus } from '../../domain/entities/orcamento.entity.js'

export class PrismaOrcamentoRepository implements IOrcamentoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Orcamento | null> {
    const row = await this.prisma.orcamento.findUnique({ where: { id }, include: { itens: true, } })
    return row ? this.toDomain(row) : null
  }

  async findMany(params: { clienteId?: string; status?: string; page: number; limit: number }) {
    const where = {
      ...(params.clienteId ? { clienteId: params.clienteId } : {}),
      ...(params.status ? { status: params.status } : {}),
    }
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.orcamento.findMany({
        where,
        include: { itens: true },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { data: 'desc' },
      }),
      this.prisma.orcamento.count({ where }),
    ])
    return { orcamentos: rows.map((r) => this.toDomain(r)), total }
  }

  async save(orcamento: Orcamento): Promise<void> {
    const existing = await this.prisma.orcamento.findUnique({ where: { id: orcamento.id } })
    if (existing) {
      await this.prisma.orcamento.update({
        where: { id: orcamento.id },
        data: {
          status: orcamento.status,
          validade: orcamento.validade,
          obs: orcamento.obs ?? null,
          vendaId: orcamento.vendaId ?? null,
          total: orcamento.total,
          formasPag: orcamento.formasPag,
          itens: {
            deleteMany: {},
            create: orcamento.itens.map((i) => ({
              id: i.id,
              produtoId: i.produtoId ?? null,
              nome: i.nome,
              qtd: i.qtd,
              valorUnitario: i.valorUnitario,
              desconto: i.desconto,
              total: i.total,
            })),
          },
        },
      })
    } else {
      const created = await this.prisma.orcamento.create({
        data: {
          id: orcamento.id,
          clienteId: orcamento.clienteId ?? null,
          animalId: orcamento.animalId ?? null,
          data: orcamento.data,
          validade: orcamento.validade,
          status: orcamento.status,
          total: orcamento.total,
          obs: orcamento.obs ?? null,
          vendaId: orcamento.vendaId ?? null,
          formasPag: orcamento.formasPag,
          itens: {
            create: orcamento.itens.map((i) => ({
              id: i.id,
              produtoId: i.produtoId ?? null,
              nome: i.nome,
              qtd: i.qtd,
              valorUnitario: i.valorUnitario,
              desconto: i.desconto,
              total: i.total,
            })),
          },
        },
        select: { numero: true },
      })
      orcamento.applyNumero(created.numero)
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.orcamento.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    numero: number
    clienteId: string | null
    animalId: string | null
    data: Date
    validade: Date
    status: string
    total: unknown
    obs: string | null
    vendaId: string | null
    formasPag: string[]
    itens: Array<{
      id: string
      produtoId: string | null
      nome: string
      qtd: number
      valorUnitario: unknown
      desconto: number
      total: unknown
    }>
  }): Orcamento {
    const entity = Orcamento.create({
      id: row.id,
      clienteId: row.clienteId ?? undefined,
      animalId: row.animalId ?? undefined,
      data: row.data,
      validade: row.validade,
      status: row.status as OrcamentoStatus,
      obs: row.obs ?? undefined,
      vendaId: row.vendaId ?? undefined,
      formasPag: row.formasPag ?? [],
      itens: row.itens.map((i) => ({
        id: i.id,
        produtoId: i.produtoId ?? undefined,
        nome: i.nome,
        qtd: i.qtd,
        valorUnitario: Number(i.valorUnitario),
        desconto: i.desconto ?? 0,
      })),
    })
    entity.applyNumero(row.numero)
    return entity
  }
}
