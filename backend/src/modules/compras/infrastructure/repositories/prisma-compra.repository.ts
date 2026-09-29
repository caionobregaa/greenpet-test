import type { PrismaClient } from '@prisma/client'
import type { ICompraRepository } from '../../domain/repositories/compra.repository.interface.js'
import { Compra, type CompraStatus } from '../../domain/entities/compra.entity.js'
import { intervaloDoMes } from '@/shared/domain/mes.js'

export class PrismaCompraRepository implements ICompraRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Compra | null> {
    const row = await this.prisma.compra.findUnique({ where: { id }, include: { itens: true } })
    return row ? this.toDomain(row) : null
  }

  async findMany(params: { status?: string; categoria?: string; fornecedor?: string; mes?: string; page: number; limit: number }) {
    const periodo = params.mes ? intervaloDoMes(params.mes) : undefined
    const where = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.categoria ? { categoria: params.categoria } : {}),
      ...(params.fornecedor ? { fornecedor: { contains: params.fornecedor, mode: 'insensitive' as const } } : {}),
      ...(periodo ? { dataPedido: { gte: periodo.inicio, lt: periodo.fim } } : {}),
    }
    // Soma do filtro inteiro (não só da página); cancelados ficam fora, como no dashboard.
    const whereTotalValor = { ...where, AND: [{ status: { not: 'cancelado' } }] }
    const [rows, total, soma] = await this.prisma.$transaction([
      this.prisma.compra.findMany({
        where,
        include: { itens: true },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { dataPedido: 'desc' },
      }),
      this.prisma.compra.count({ where }),
      this.prisma.compra.aggregate({ where: whereTotalValor, _sum: { total: true } }),
    ])
    return { compras: rows.map((r) => this.toDomain(r)), total, totalValor: Number(soma._sum.total ?? 0) }
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
          formaPag: compra.formaPag ?? null,
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
          formaPag: compra.formaPag ?? null,
          status: compra.status,
          total: compra.total,
          obs: compra.obs ?? null,
          itens: {
            create: compra.itens.map((i) => ({
              id: i.id,
              produtoId: i.produtoId ?? null,
              nome: i.nome,
              qtd: i.qtd,
              pesoKg: i.pesoKg ?? null,
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
    formaPag?: string | null
    status: string
    total: unknown
    obs: string | null
    itens: Array<{
      id: string
      produtoId: string | null
      nome: string
      qtd: number
      pesoKg?: unknown
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
      formaPag: row.formaPag ?? undefined,
      status: row.status as CompraStatus,
      obs: row.obs ?? undefined,
      // Despesas sem itens (aluguel, luz...) só têm o total gravado; com itens, a entidade recalcula.
      totalManual: Number(row.total),
      itens: row.itens.map((i) => ({
        id: i.id,
        produtoId: i.produtoId ?? undefined,
        nome: i.nome,
        qtd: i.qtd,
        pesoKg: i.pesoKg != null ? Number(i.pesoKg) : undefined,
        valorUnitario: Number(i.valorUnitario),
      })),
    })
  }
}
