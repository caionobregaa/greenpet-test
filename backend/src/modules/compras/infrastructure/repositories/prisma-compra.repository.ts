import type { PrismaClient } from '@prisma/client'
import type { ICompraRepository } from '../../domain/repositories/compra.repository.interface.js'
import { Compra, type CompraStatus } from '../../domain/entities/compra.entity.js'

export class PrismaCompraRepository implements ICompraRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Compra | null> {
    const row = await this.prisma.compra.findUnique({ where: { id }, include: { itens: true } })
    return row ? this.toDomain(row) : null
  }

  async findMany(params: { status?: string; categoria?: string; fornecedor?: string; page: number; limit: number }) {
    const where = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.categoria ? { categoria: params.categoria } : {}),
      ...(params.fornecedor ? { fornecedor: { contains: params.fornecedor, mode: 'insensitive' as const } } : {}),
    }
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.compra.findMany({
        where,
        include: { itens: true },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { dataPedido: 'desc' },
      }),
      this.prisma.compra.count({ where }),
    ])
    return { compras: rows.map((r) => this.toDomain(r)), total }
  }

  async save(compra: Compra): Promise<void> {
    const existing = await this.prisma.compra.findUnique({ where: { id: compra.id } })
    if (existing) {
      await this.prisma.compra.update({
        where: { id: compra.id },
        data: {
          fornecedor: compra.fornecedor,
          categoria: compra.categoria,
          descricaoSimples: compra.descricaoSimples ?? null,
          status: compra.status,
          obs: compra.obs ?? null,
          total: compra.total,
          dataPedido: compra.dataPedido,
          dataRecebimento: compra.dataRecebimento ?? null,
        },
      })
    } else {
      await this.prisma.compra.create({
        data: {
          id: compra.id,
          fornecedor: compra.fornecedor,
          dataPedido: compra.dataPedido,
          dataRecebimento: compra.dataRecebimento ?? null,
          categoria: compra.categoria,
          descricaoSimples: compra.descricaoSimples ?? null,
          status: compra.status,
          total: compra.total,
          obs: compra.obs ?? null,
          itens: {
            create: compra.itens.map((i) => ({
              id: i.id,
              produtoId: i.produtoId ?? null,
              nome: i.nome,
              qtd: i.qtd,
              valorUnitario: i.valorUnitario,
              total: i.total,
            })),
          },
        },
      })
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.compra.delete({ where: { id } })
  }

  private toDomain(row: {
    id: string
    fornecedor: string
    dataPedido: Date
    dataRecebimento: Date | null
    categoria: string
    descricaoSimples: string | null
    status: string
    total: unknown
    obs: string | null
    itens: Array<{
      id: string
      produtoId: string | null
      nome: string
      qtd: number
      valorUnitario: unknown
      total: unknown
    }>
  }): Compra {
    return Compra.create({
      id: row.id,
      fornecedor: row.fornecedor,
      dataPedido: row.dataPedido,
      dataRecebimento: row.dataRecebimento ?? undefined,
      categoria: row.categoria,
      descricaoSimples: row.descricaoSimples ?? undefined,
      status: row.status as CompraStatus,
      obs: row.obs ?? undefined,
      itens: row.itens.map((i) => ({
        id: i.id,
        produtoId: i.produtoId ?? undefined,
        nome: i.nome,
        qtd: i.qtd,
        valorUnitario: Number(i.valorUnitario),
      })),
    })
  }
}
