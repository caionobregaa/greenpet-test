import type { PrismaClient } from '@prisma/client'
import { calcularCurvaAbc, type Curva } from '../../domain/services/curva-abc.service.js'

export interface CurvaVendaProduto {
  produtoId: string
  produtoNome: string
  categoria: string
  quantidadeVendida: number
  receitaTotal: number
  percentualReceita: number
  percentualAcumulado: number
  curva: Curva
}

export class PrismaCurvaVendaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findCurvaAbc(params: {
    dataInicio?: Date
    dataFim?: Date
    categoria?: string
    page: number
    limit: number
  }): Promise<{ produtos: CurvaVendaProduto[]; total: number; resumo: Record<Curva, number> }> {
    const dataFiltro =
      params.dataInicio || params.dataFim
        ? {
            ...(params.dataInicio ? { gte: params.dataInicio } : {}),
            ...(params.dataFim ? { lte: params.dataFim } : {}),
          }
        : undefined

    const grupos = await this.prisma.vendaItem.groupBy({
      by: ['produtoId'],
      where: {
        produtoId: { not: null },
        ...(dataFiltro ? { venda: { data: dataFiltro } } : {}),
      },
      _sum: { total: true, qtd: true },
    })

    if (grupos.length === 0) return { produtos: [], total: 0, resumo: { A: 0, B: 0, C: 0 } }

    const produtoIds = grupos.map((g) => g.produtoId).filter((id): id is string => id !== null)
    const produtos = await this.prisma.produto.findMany({
      where: {
        id: { in: produtoIds },
        deletedAt: null,
        ...(params.categoria ? { categoria: params.categoria } : {}),
      },
      select: { id: true, nome: true, categoria: true },
    })
    const produtoMap = new Map(produtos.map((p) => [p.id, p]))

    const itens = grupos
      .filter((g) => g.produtoId && produtoMap.has(g.produtoId))
      .map((g) => ({
        produtoId: g.produtoId as string,
        receita: Number(g._sum.total ?? 0),
        qtd: g._sum.qtd ?? 0,
      }))

    const curva = calcularCurvaAbc(itens)

    const resultado: CurvaVendaProduto[] = curva.map((item) => {
      const produto = produtoMap.get(item.produtoId)!
      return {
        produtoId: item.produtoId,
        produtoNome: produto.nome,
        categoria: produto.categoria,
        quantidadeVendida: item.quantidadeVendida,
        receitaTotal: item.receitaTotal,
        percentualReceita: item.percentualReceita,
        percentualAcumulado: item.percentualAcumulado,
        curva: item.curva,
      }
    })

    const resumo: Record<Curva, number> = { A: 0, B: 0, C: 0 }
    for (const item of resultado) resumo[item.curva]++

    const total = resultado.length
    const paginado = resultado.slice((params.page - 1) * params.limit, params.page * params.limit)

    return { produtos: paginado, total, resumo }
  }
}
