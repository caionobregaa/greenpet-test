import type { PrismaClient } from '@prisma/client'

export interface DashboardKPIs {
  periodo: { inicio: string; fim: string }
  totalReceita: number
  totalLucroLiquido: number
  totalVendas: number
  ticketMedio: number
  topClientes: Array<{ clienteId: string; nome: string; totalGasto: number; vendas: number }>
  topProdutos: Array<{ produtoId: string; nome: string; totalVendido: number; quantidade: number }>
  receitaPorMes: Array<{ mes: string; receita: number; vendas: number }>
}

export class PrismaDashboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getKPIs(params: { inicio: Date; fim: Date }): Promise<DashboardKPIs> {
    const { inicio, fim } = params

    // Basic aggregates
    const vendaAggregate = await this.prisma.venda.aggregate({
      where: { data: { gte: inicio, lte: fim } },
      _sum: { total: true },
      _count: { id: true },
    })

    const totalReceita = Number(vendaAggregate._sum.total ?? 0)
    const totalVendas = vendaAggregate._count.id
    const ticketMedio = totalVendas > 0 ? totalReceita / totalVendas : 0

    // Lucro líquido = receita após taxas do cartão
    const lucroResult = await this.prisma.$queryRaw<Array<{ lucro: string }>>`
      SELECT COALESCE(SUM(CAST(total AS DOUBLE PRECISION) * (1.0 - "taxaCartao" / 100.0)), 0)::text AS lucro
      FROM vendas
      WHERE data >= ${inicio} AND data <= ${fim}
    `
    const totalLucroLiquido = Number(lucroResult[0]?.lucro ?? 0)

    // Top clientes
    const clienteGroups = await this.prisma.venda.groupBy({
      by: ['clienteId'],
      where: { data: { gte: inicio, lte: fim } },
      _sum: { total: true },
      _count: { id: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 10,
    })

    const clienteIds = clienteGroups.map((g) => g.clienteId)
    const clientes = await this.prisma.cliente.findMany({
      where: { id: { in: clienteIds } },
      select: { id: true, nome: true },
    })
    const clienteMap = new Map(clientes.map((c) => [c.id, c.nome]))

    const topClientes = clienteGroups.map((g) => ({
      clienteId: g.clienteId,
      nome: clienteMap.get(g.clienteId) ?? 'Desconhecido',
      totalGasto: Number(g._sum.total ?? 0),
      vendas: g._count.id,
    }))

    // Top produtos (by venda items)
    const itemGroups = await this.prisma.vendaItem.groupBy({
      by: ['produtoId', 'nome'],
      where: {
        venda: { data: { gte: inicio, lte: fim } },
        produtoId: { not: null },
      },
      _sum: { total: true, qtd: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 10,
    })

    const topProdutos = itemGroups.map((g) => ({
      produtoId: g.produtoId ?? '',
      nome: g.nome,
      totalVendido: Number(g._sum.total ?? 0),
      quantidade: Number(g._sum.qtd ?? 0),
    }))

    // Monthly breakdown
    const vendas = await this.prisma.venda.findMany({
      where: { data: { gte: inicio, lte: fim } },
      select: { data: true, total: true },
      orderBy: { data: 'asc' },
    })

    const monthlyMap = new Map<string, { receita: number; vendas: number }>()
    for (const v of vendas) {
      const mes = v.data.toISOString().slice(0, 7)
      const existing = monthlyMap.get(mes) ?? { receita: 0, vendas: 0 }
      monthlyMap.set(mes, {
        receita: existing.receita + Number(v.total),
        vendas: existing.vendas + 1,
      })
    }

    const receitaPorMes = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, data]) => ({ mes, ...data }))

    return {
      periodo: {
        inicio: inicio.toISOString().slice(0, 10),
        fim: fim.toISOString().slice(0, 10),
      },
      totalReceita,
      totalLucroLiquido: Math.round(totalLucroLiquido * 100) / 100,
      totalVendas,
      ticketMedio: Math.round(ticketMedio * 100) / 100,
      topClientes,
      topProdutos,
      receitaPorMes,
    }
  }
}
