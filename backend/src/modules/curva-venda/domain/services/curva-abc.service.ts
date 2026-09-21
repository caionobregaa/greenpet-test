export type Curva = 'A' | 'B' | 'C'

export function classifyCurva(percentualAcumulado: number): Curva {
  if (percentualAcumulado <= 80) return 'A'
  if (percentualAcumulado <= 95) return 'B'
  return 'C'
}

export interface CurvaAbcInput {
  produtoId: string
  receita: number
  qtd: number
}

export interface CurvaAbcItem {
  produtoId: string
  quantidadeVendida: number
  receitaTotal: number
  percentualReceita: number
  percentualAcumulado: number
  curva: Curva
}

export function calcularCurvaAbc(itens: CurvaAbcInput[]): CurvaAbcItem[] {
  const receitaGeral = itens.reduce((sum, item) => sum + item.receita, 0)
  if (receitaGeral <= 0) return []

  const ordenados = [...itens].sort((a, b) => b.receita - a.receita)

  let acumulado = 0
  return ordenados.map((item) => {
    const percentualReceita = Math.round((item.receita / receitaGeral) * 100 * 100) / 100
    acumulado = Math.round((acumulado + percentualReceita) * 100) / 100
    return {
      produtoId: item.produtoId,
      quantidadeVendida: item.qtd,
      receitaTotal: item.receita,
      percentualReceita,
      percentualAcumulado: acumulado,
      curva: classifyCurva(acumulado),
    }
  })
}

/**
 * Campos pelos quais a listagem (já classificada em A/B/C) pode ser reordenada
 * para exibição. Não afeta o cálculo do % acumulado — isso é sempre feito por
 * calcularCurvaAbc() com base na receita, antes de qualquer reordenação aqui.
 */
export type CurvaVendaSortField =
  | 'categoria'
  | 'quantidadeVendida'
  | 'receitaTotal'
  | 'percentualReceita'
  | 'percentualAcumulado'
  | 'melhorMargem'

export type SortOrder = 'asc' | 'desc'

export interface Ordenavel {
  categoria: string
  quantidadeVendida: number
  receitaTotal: number
  percentualReceita: number
  percentualAcumulado: number
  melhorMargem: number
}

export function ordenarCurvaVenda<T extends Ordenavel>(
  itens: T[],
  sortBy?: CurvaVendaSortField,
  sortOrder: SortOrder = 'desc',
): T[] {
  if (!sortBy) return itens

  const dir = sortOrder === 'asc' ? 1 : -1
  return [...itens].sort((a, b) => {
    const va = a[sortBy]
    const vb = b[sortBy]
    if (typeof va === 'string' && typeof vb === 'string') {
      return va.localeCompare(vb, 'pt-BR') * dir
    }
    return ((va as number) - (vb as number)) * dir
  })
}
