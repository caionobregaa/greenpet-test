import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { ValidationError } from '@/shared/errors/validation.error.js'
import { type TxClient, tirarDoEstoque } from '../movimentacao-estoque.js'

// Diagnóstico do estoque e correção retroativa das vendas antigas (specs/estoque/spec-v2.md).

const CorrecaoSchema = z.object({ aplicar: z.boolean() })

/** Sinaliza o rollback da simulação. */
class Simulacao extends Error {}

interface ItemCorrigido {
  vendaId: string
  vendaNumero: number
  vendaData: Date
  produtoId: string
  produtoNome: string
  qtd: number
  qtdBaixada: number
}

/**
 * Para cada item pendente (qtdBaixada vazio), da venda mais antiga para a mais nova, tira dos
 * lotes que já existiam quando a venda foi registrada e grava quanto tirou.
 */
async function corrigirPendentes(tx: TxClient): Promise<ItemCorrigido[]> {
  const pendentes = await tx.vendaItem.findMany({
    where: { qtdBaixada: null, produtoId: { not: null } },
    select: {
      id: true,
      qtd: true,
      produtoId: true,
      produto: { select: { nome: true } },
      venda: { select: { id: true, numero: true, data: true, createdAt: true } },
    },
    orderBy: [{ venda: { createdAt: 'asc' } }, { venda: { numero: 'asc' } }],
  })

  const corrigidos: ItemCorrigido[] = []
  for (const item of pendentes) {
    const qtdBaixada = await tirarDoEstoque(tx, item.produtoId!, item.qtd, { lotesAte: item.venda.createdAt })
    await tx.vendaItem.update({ where: { id: item.id }, data: { qtdBaixada } })
    corrigidos.push({
      vendaId: item.venda.id,
      vendaNumero: item.venda.numero,
      vendaData: item.venda.data,
      produtoId: item.produtoId!,
      produtoNome: item.produto?.nome ?? '—',
      qtd: item.qtd,
      qtdBaixada,
    })
  }
  return corrigidos
}

export function registerEstoqueDiagnosticoRoutes(app: FastifyInstance, prisma: PrismaClient): void {
  app.get('/api/v1/estoque/diagnostico', async (_req, rep) => {
    const [semProduto, comBaixa, pendentes, duplicados] = await Promise.all([
      prisma.vendaItem.findMany({
        where: { produtoId: null },
        select: { nome: true, qtd: true, venda: { select: { id: true, numero: true, data: true } } },
        orderBy: { venda: { data: 'desc' } },
        take: 200,
      }),
      prisma.vendaItem.findMany({
        where: { produtoId: { not: null }, qtdBaixada: { not: null } },
        select: {
          qtd: true,
          qtdBaixada: true,
          produtoId: true,
          produto: { select: { nome: true } },
          venda: { select: { id: true, numero: true, data: true } },
        },
      }),
      prisma.vendaItem.aggregate({
        where: { qtdBaixada: null, produtoId: { not: null } },
        _count: { _all: true },
        _sum: { qtd: true },
      }),
      prisma.$queryRaw<Array<{ id: string; nome: string; sku: string; chave: string; estoque: string }>>`
        SELECT p.id, p.nome, p.sku, lower(trim(p.nome)) AS chave,
               COALESCE((SELECT SUM(e.quantidade) FROM estoque_itens e WHERE e."produtoId" = p.id), 0)::text AS estoque
        FROM produtos p
        WHERE p."deletedAt" IS NULL
          AND lower(trim(p.nome)) IN (
            SELECT lower(trim(nome)) FROM produtos WHERE "deletedAt" IS NULL
            GROUP BY lower(trim(nome)) HAVING COUNT(*) > 1
          )
        ORDER BY chave, p.nome
      `,
    ])

    const grupos = new Map<string, Array<{ id: string; nome: string; sku: string; estoque: number }>>()
    for (const d of duplicados) {
      grupos.set(d.chave, [...(grupos.get(d.chave) ?? []), { id: d.id, nome: d.nome, sku: d.sku, estoque: Number(d.estoque) }])
    }

    rep.send({
      data: {
        itensSemProduto: semProduto.map((i) => ({
          vendaId: i.venda.id, vendaNumero: i.venda.numero, vendaData: i.venda.data, nome: i.nome, qtd: i.qtd,
        })),
        baixasIncompletas: comBaixa
          .filter((i) => i.qtdBaixada! < i.qtd)
          .map((i) => ({
            vendaId: i.venda.id, vendaNumero: i.venda.numero, vendaData: i.venda.data,
            produtoId: i.produtoId!, produtoNome: i.produto?.nome ?? '—', qtd: i.qtd, qtdBaixada: i.qtdBaixada!,
          }))
          .sort((a, b) => b.vendaData.getTime() - a.vendaData.getTime()),
        produtosDuplicados: [...grupos.values()].map((produtos) => ({ nome: produtos[0].nome, produtos })),
        pendentesCorrecao: { itens: pendentes._count._all, unidades: pendentes._sum.qtd ?? 0 },
      },
    })
  })

  app.post('/api/v1/estoque/correcao-retroativa', async (req, rep) => {
    const body = CorrecaoSchema.safeParse(req.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)

    let itens: ItemCorrigido[] = []
    try {
      await prisma.$transaction(async (raw) => {
        itens = await corrigirPendentes(raw as unknown as TxClient)
        // Simular roda a correção de verdade e desfaz tudo no fim
        if (!body.data.aplicar) throw new Simulacao()
      }, { timeout: 120_000 })
    } catch (err) {
      if (!(err instanceof Simulacao)) throw err
    }

    rep.send({
      data: {
        aplicado: body.data.aplicar,
        itens,
        totalItens: itens.length,
        totalUnidades: itens.reduce((s, i) => s + i.qtdBaixada, 0),
      },
    })
  })
}
