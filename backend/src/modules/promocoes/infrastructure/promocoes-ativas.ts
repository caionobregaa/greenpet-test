import type { PrismaClient } from '@prisma/client'

export interface PromocaoAtiva {
  campanhaId: string
  nome: string
  valorPromocional: number
  fim: Date
}

/**
 * Promoção ativa agora, por produto (specs/promocoes/spec-v1.md). Sem `produtoIds`, devolve
 * todas. A regra de não sobreposição garante no máximo uma por produto; se houver mais de uma,
 * vale o menor preço.
 */
export async function buscarPromocoesAtivas(
  prisma: PrismaClient,
  produtoIds?: string[],
  agora: Date = new Date(),
): Promise<Map<string, PromocaoAtiva>> {
  if (produtoIds && produtoIds.length === 0) return new Map()
  const rows = await prisma.promocaoItem.findMany({
    where: {
      ...(produtoIds ? { produtoId: { in: produtoIds } } : {}),
      promocao: { inicio: { lte: agora }, fim: { gte: agora } },
    },
    include: { promocao: { select: { id: true, nome: true, fim: true } } },
  })
  const mapa = new Map<string, PromocaoAtiva>()
  for (const r of rows) {
    const valorPromocional = Number(r.valorPromocional)
    const atual = mapa.get(r.produtoId)
    if (atual && atual.valorPromocional <= valorPromocional) continue
    mapa.set(r.produtoId, { campanhaId: r.promocao.id, nome: r.promocao.nome, valorPromocional, fim: r.promocao.fim })
  }
  return mapa
}
