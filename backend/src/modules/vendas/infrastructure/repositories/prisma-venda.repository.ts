import type { PrismaClient } from '@prisma/client'
import type { IVendaRepository } from '../../domain/repositories/venda.repository.interface.js'
import { Venda } from '../../domain/entities/venda.entity.js'

export class PrismaVendaRepository implements IVendaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Venda | null> {
    const row = await this.prisma.venda.findUnique({ where: { id }, include: { itens: true } })
    return row ? this.toDomain(row) : null
  }

  async findMany(params: { clienteId?: string; animalId?: string; page: number; limit: number }) {
    const where = {
      ...(params.clienteId ? { clienteId: params.clienteId } : {}),
      ...(params.animalId ? { animalId: params.animalId } : {}),
    }
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.venda.findMany({
        where,
        include: { itens: true },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { data: 'desc' },
      }),
      this.prisma.venda.count({ where }),
    ])
    return { vendas: rows.map((r) => this.toDomain(r)), total }
  }

  async save(venda: Venda): Promise<void> {
    await this.prisma.venda.upsert({
      where: { id: venda.id },
      create: {
        id: venda.id,
        data: venda.data,
        clienteId: venda.clienteId,
        animalId: venda.animalId ?? null,
        formaPag: venda.formaPag,
        taxaCartao: venda.taxaCartao,
        taxaEntrega: venda.taxaEntrega,
        desconto: venda.desconto,
        total: venda.total,
        obs: venda.obs ?? null,
        itens: {
          create: venda.itens.map((i) => ({
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
      update: {
        data: venda.data,
        clienteId: venda.clienteId,
        animalId: venda.animalId ?? null,
        formaPag: venda.formaPag,
        taxaCartao: venda.taxaCartao,
        taxaEntrega: venda.taxaEntrega,
        desconto: venda.desconto,
        total: venda.total,
        obs: venda.obs ?? null,
        itens: {
          deleteMany: {},
          create: venda.itens.map((i) => ({
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
  }

  async delete(id: string): Promise<void> {
    await this.prisma.venda.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    data: Date
    clienteId: string
    animalId: string | null
    formaPag: string
    taxaCartao: number
    taxaEntrega: number
    desconto: number
    total: unknown
    obs: string | null
    createdAt: Date
    itens: Array<{
      id: string
      produtoId: string | null
      nome: string
      qtd: number
      valorUnitario: unknown
      desconto: number
      total: unknown
    }>
  }): Venda {
    return Venda.create({
      id: row.id,
      clienteId: row.clienteId,
      animalId: row.animalId ?? undefined,
      data: row.data,
      formaPag: row.formaPag,
      taxaCartao: row.taxaCartao ?? 0,
      taxaEntrega: row.taxaEntrega ?? 0,
      desconto: row.desconto ?? 0,
      obs: row.obs ?? undefined,
      itens: row.itens.map((i) => ({
        id: i.id,
        produtoId: i.produtoId ?? undefined,
        nome: i.nome,
        qtd: i.qtd,
        valorUnitario: Number(i.valorUnitario),
        desconto: i.desconto ?? 0,
      })),
    })
  }
}
