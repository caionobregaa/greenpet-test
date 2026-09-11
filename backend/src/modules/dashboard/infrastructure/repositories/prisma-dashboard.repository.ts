import type { PrismaClient } from '@prisma/client'

export interface DashboardScalarMetrics {
  totalReceita: number
  totalLucroLiquido: number
  totalTaxasCartao: number
  totalLucroLiquidoReal: number
  totalVendas: number
  ticketMedio: number
  totalCustoAquisicao: number
}

export interface DashboardKPIs extends DashboardScalarMetrics {
  periodo: { inicio: string; fim: string }
  topClientes: Array<{ clienteId: string; nome: string; totalGasto: number; vendas: number }>
  topProdutos: Array<{ produtoId: string; nome: string; totalVendido: number; quantidade: number }>
  receitaPorMes: Array<{ mes: string; receita: number; vendas: number }>
  comprasPorFornecedor: Array<{ fornecedor: string; totalComprado: number; compras: number }>
  vendasPorFormaPagamento: Array<{ formaPag: string; total: number; vendas: number }>
  despesasPorCategoria: Array<{ categoria: string; total: number; compras: number }>
}

export class PrismaDashboardRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Métricas escalares (sem listas/breakdowns) de um período — usado tanto
   * para o período atual quanto para o período anterior de comparação, sem
   * pagar o custo das agregações de listagem (top clientes, top produtos etc).
   */
  async getScalarMetrics(params: { inicio: Date; fim: Date }): Promise<DashboardScalarMetrics> {
    const { inicio, fim } = params

    const vendaAggregate = await this.prisma.venda.aggregate({
      where: { data: { gte: inicio, lte: fim } },
      _sum: { total: true },
      _count: { id: true },
    })

    const totalReceita = Number(vendaAggregate._sum.total ?? 0)
    const totalVendas = vendaAggregate._count.id
    const ticketMedio = totalVendas > 0 ? totalReceita / totalVendas : 0

    // Lucro bruto = receita total menos custo de aquisição dos produtos vendidos
    const lucroResult = await this.prisma.$queryRaw<Array<{ lucro: string }>>`
      SELECT COALESCE(SUM(
        CAST(v.total AS DOUBLE PRECISION)
        - COALESCE(ic.custo, 0)
      ), 0)::text AS lucro
      FROM vendas v
      LEFT JOIN (
        SELECT vi."vendaId",
               SUM(vi.qtd * COALESCE(CAST(p."valorCusto" AS DOUBLE PRECISION), 0)) AS custo
        FROM venda_itens vi
        LEFT JOIN produtos p ON p.id = vi."produtoId"
        GROUP BY vi."vendaId"
      ) ic ON ic."vendaId" = v.id
      WHERE v.data >= ${inicio} AND v.data <= ${fim}
    `
    const totalLucroLiquido = Number(lucroResult[0]?.lucro ?? 0)

    // Taxa de cartão: armazenada em % (ex. 3.15 = 3,15%) sobre o total da venda.
    // É o único custo que não está refletido em `venda.total` (taxaEntrega e
    // desconto já entram no total — ver venda.entity.ts) nem no lucro bruto acima.
    const taxasResult = await this.prisma.$queryRaw<Array<{ taxas: string }>>`
      SELECT COALESCE(SUM(
        CAST(total AS DOUBLE PRECISION) * (COALESCE("taxaCartao", 0) / 100)
      ), 0)::text AS taxas
      FROM vendas
      WHERE data >= ${inicio} AND data <= ${fim}
    `
    const totalTaxasCartao = Number(taxasResult[0]?.taxas ?? 0)
    const totalLucroLiquidoReal = totalLucroLiquido - totalTaxasCartao

    // Custo de aquisição = soma das despesas/compras no período (exceto canceladas)
    const custoAggregate = await this.prisma.compra.aggregate({
      where: { dataPedido: { gte: inicio, lte: fim }, status: { not: 'cancelado' } },
      _sum: { total: true },
    })
    const totalCustoAquisicao = Number(custoAggregate._sum.total ?? 0)

    return {
      totalReceita: Math.round(totalReceita * 100) / 100,
      totalLucroLiquido: Math.round(totalLucroLiquido * 100) / 100,
      totalTaxasCartao: Math.round(totalTaxasCartao * 100) / 100,
      totalLucroLiquidoReal: Math.round(totalLucroLiquidoReal * 100) / 100,
      totalVendas,
      ticketMedio: Math.round(ticketMedio * 100) / 100,
      totalCustoAquisicao: Math.round(totalCustoAquisicao * 100) / 100,
    }
  }

  async getKPIs(params: { inicio: Date; fim: Date }): Promise<DashboardKPIs> {
    const { inicio, fim } = params

    const scalar = await this.getScalarMetrics({ inicio, fim })

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
      monthlyMap.set(mes, { receita: existing.receita + Number(v.total), vendas: existing.vendas + 1 })
    }
    const receitaPorMes = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([mes, data]) => ({ mes, ...data }))

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
      where: { venda: { data: { gte: inicio, lte: fim } }, produtoId: { not: null } },
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

    // Vendas por forma de pagamento
    const formaPagGroups = await this.prisma.venda.groupBy({
      by: ['formaPag'],
      where: { data: { gte: inicio, lte: fim } },
      _sum: { total: true },
      _count: { id: true },
      orderBy: { _sum: { total: 'desc' } },
    })
    const vendasPorFormaPagamento = formaPagGroups.map((g) => ({
      formaPag: g.formaPag,
      total: Number(g._sum.total ?? 0),
      vendas: g._count.id,
    }))

    // Compras por fornecedor/distribuidora (mesmo filtro de período/status do custo de aquisição)
    const fornecedorGroups = await this.prisma.compra.groupBy({
      by: ['fornecedor'],
      where: { dataPedido: { gte: inicio, lte: fim }, status: { not: 'cancelado' } },
      _sum: { total: true },
      _count: { id: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 10,
    })
    const comprasPorFornecedor = fornecedorGroups.map((g) => ({
      fornecedor: g.fornecedor,
      totalComprado: Number(g._sum.total ?? 0),
      compras: g._count.id,
    }))

    // Despesas por categoria (mesmo padrão de comprasPorFornecedor, agrupando por categoria)
    const categoriaGroups = await this.prisma.compra.groupBy({
      by: ['categoria'],
      where: { dataPedido: { gte: inicio, lte: fim }, status: { not: 'cancelado' } },
      _sum: { total: true },
      _count: { id: true },
      orderBy: { _sum: { total: 'desc' } },
    })
    const despesasPorCategoria = categoriaGroups.map((g) => ({
      categoria: g.categoria,
      total: Number(g._sum.total ?? 0),
      compras: g._count.id,
    }))

    return {
      periodo: { inicio: inicio.toISOString().slice(0, 10), fim: fim.toISOString().slice(0, 10) },
      ...scalar,
      topClientes,
      topProdutos,
      receitaPorMes,
      comprasPorFornecedor,
      vendasPorFormaPagamento,
      despesasPorCategoria,
    }
  }
}
