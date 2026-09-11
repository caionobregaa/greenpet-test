import { Prisma, type PrismaClient } from '@prisma/client'

export interface VendaMargemNegativa {
  vendaId: string
  numero: number
  data: Date
  clienteNome: string
  total: number
  custo: number
  margem: number
}

export interface ProdutoEstoqueBaixo {
  produtoId: string
  nome: string
  categoria: string
  estoqueAtual: number
  estoqueMinimo: number
}

export class PrismaDashboardOperacionalRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Vendas cujo total ficou abaixo do custo de aquisição dos produtos
   * vendidos (mesmo padrão de JOIN do lucro bruto em prisma-dashboard.repository.ts,
   * mas retornando uma linha por venda em vez de somar tudo).
   */
  async findVendasMargemNegativa(inicio: Date, fim: Date): Promise<VendaMargemNegativa[]> {
    const rows = await this.prisma.$queryRaw<
      Array<{ id: string; numero: number; data: Date; clienteNome: string; total: string; custo: string }>
    >(Prisma.sql`
      SELECT v.id, v.numero, v.data, c.nome AS "clienteNome",
             CAST(v.total AS DOUBLE PRECISION)::text AS total,
             COALESCE(ic.custo, 0)::text AS custo
      FROM vendas v
      JOIN clientes c ON c.id = v."clienteId"
      LEFT JOIN (
        SELECT vi."vendaId",
               SUM(vi.qtd * COALESCE(CAST(p."valorCusto" AS DOUBLE PRECISION), 0)) AS custo
        FROM venda_itens vi
        LEFT JOIN produtos p ON p.id = vi."produtoId"
        GROUP BY vi."vendaId"
      ) ic ON ic."vendaId" = v.id
      WHERE v.data >= ${inicio} AND v.data <= ${fim}
        AND (CAST(v.total AS DOUBLE PRECISION) - COALESCE(ic.custo, 0)) < 0
      ORDER BY v.data DESC
    `)

    return rows.map((r) => {
      const total = Number(r.total)
      const custo = Number(r.custo)
      return {
        vendaId: r.id,
        numero: r.numero,
        data: r.data,
        clienteNome: r.clienteNome,
        total,
        custo,
        margem: Math.round((total - custo) * 100) / 100,
      }
    })
  }

  /**
   * Produtos com `estoqueMinimo` configurado cuja soma de lotes em estoque
   * ficou abaixo desse mínimo. Produtos sem `estoqueMinimo` definido ficam
   * de fora — é assim que "só quando existir estoque próprio configurado"
   * é respeitado.
   */
  async findEstoqueBaixo(): Promise<ProdutoEstoqueBaixo[]> {
    const rows = await this.prisma.$queryRaw<
      Array<{ id: string; nome: string; categoria: string; estoqueMinimo: number; estoqueAtual: string }>
    >(Prisma.sql`
      SELECT p.id, p.nome, p.categoria, p."estoqueMinimo",
             COALESCE(SUM(e.quantidade), 0)::text AS "estoqueAtual"
      FROM produtos p
      LEFT JOIN estoque_itens e ON e."produtoId" = p.id
      WHERE p."estoqueMinimo" IS NOT NULL AND p."deletedAt" IS NULL
      GROUP BY p.id, p.nome, p.categoria, p."estoqueMinimo"
      HAVING COALESCE(SUM(e.quantidade), 0) < p."estoqueMinimo"
      ORDER BY p.nome ASC
    `)

    return rows.map((r) => ({
      produtoId: r.id,
      nome: r.nome,
      categoria: r.categoria,
      estoqueAtual: Number(r.estoqueAtual),
      estoqueMinimo: r.estoqueMinimo,
    }))
  }
}
