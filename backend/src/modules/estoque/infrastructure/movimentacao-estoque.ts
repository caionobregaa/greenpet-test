import type { PrismaClient } from '@prisma/client'

// Movimentação de estoque pelas vendas (specs/estoque/spec-v2.md).

export type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

/**
 * Tira até `qtd` unidades dos lotes do produto, validade mais próxima primeiro (lote zerado
 * é removido). Com estoque insuficiente tira só o que existe. `lotesAte` restringe aos lotes
 * criados até essa data (correção retroativa). Retorna quanto foi tirado.
 */
export async function tirarDoEstoque(
  tx: TxClient,
  produtoId: string,
  qtd: number,
  opts: { lotesAte?: Date } = {},
): Promise<number> {
  if (qtd <= 0) return 0
  const lotes = await tx.estoqueItem.findMany({
    where: {
      produtoId,
      quantidade: { gt: 0 },
      ...(opts.lotesAte ? { createdAt: { lte: opts.lotesAte } } : {}),
    },
    orderBy: [{ validade: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
  })

  let restante = qtd
  for (const lote of lotes) {
    if (restante <= 0) break
    const consumir = Math.min(lote.quantidade, restante)
    restante -= consumir
    const novaQtd = lote.quantidade - consumir
    if (novaQtd <= 0) {
      await tx.estoqueItem.delete({ where: { id: lote.id } })
    } else {
      await tx.estoqueItem.update({ where: { id: lote.id }, data: { quantidade: novaQtd } })
    }
  }
  return qtd - restante
}

/** Devolve unidades ao estoque como um lote novo, sem validade. */
export async function devolverAoEstoque(tx: TxClient, produtoId: string, qtd: number, obs: string): Promise<void> {
  if (qtd <= 0) return
  await tx.estoqueItem.create({ data: { produtoId, quantidade: qtd, validade: null, lote: null, obs } })
}

/**
 * Reparte `total` entre itens na ordem, sem passar da quantidade de cada um
 * (o último absorve qualquer sobra).
 */
export function distribuirBaixa(total: number, qtds: number[]): number[] {
  let restante = total
  return qtds.map((q, i) => {
    const parte = i === qtds.length - 1 ? restante : Math.min(q, restante)
    restante -= parte
    return parte
  })
}

export function rotuloVenda(numero: number | null | undefined): string {
  return numero ? `V${String(numero).padStart(5, '0')}` : 'sem número'
}

export interface AvisoEstoque {
  produtoId: string
  nome: string
  qtd: number
  qtdBaixada: number
}

/** Itens da venda que tiraram menos do que foi vendido (estoque insuficiente). */
export async function avisosEstoqueDaVenda(prisma: TxClient, vendaId: string): Promise<AvisoEstoque[]> {
  const itens = await prisma.vendaItem.findMany({
    where: { vendaId, produtoId: { not: null }, qtdBaixada: { not: null } },
    select: { produtoId: true, nome: true, qtd: true, qtdBaixada: true },
  })
  return itens
    .filter((i) => i.qtdBaixada! < i.qtd)
    .map((i) => ({ produtoId: i.produtoId!, nome: i.nome, qtd: i.qtd, qtdBaixada: i.qtdBaixada! }))
}
