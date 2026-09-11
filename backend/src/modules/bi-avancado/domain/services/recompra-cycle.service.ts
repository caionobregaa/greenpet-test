/**
 * Funções puras para calcular o ciclo médio de recompra (dias entre compras
 * consecutivas) a partir de uma lista de datas — usadas agrupadas por
 * cliente+categoria e depois "pooladas" por categoria no repositório.
 */

/** Remove datas duplicadas (mesmo dia) e ordena ascendente. */
export function uniqueSortedDates(datas: Date[]): Date[] {
  const dias = new Set(datas.map((d) => d.toISOString().slice(0, 10)))
  return Array.from(dias)
    .sort()
    .map((s) => new Date(`${s}T00:00:00.000Z`))
}

/** Diferença em dias entre cada par de datas consecutivas (já ordenadas/únicas). */
export function consecutiveIntervalsDays(datasOrdenadas: Date[]): number[] {
  const intervalos: number[] = []
  for (let i = 1; i < datasOrdenadas.length; i++) {
    const dias = Math.round((datasOrdenadas[i].getTime() - datasOrdenadas[i - 1].getTime()) / (1000 * 60 * 60 * 24))
    intervalos.push(dias)
  }
  return intervalos
}

/** Média simples, arredondada a 2 casas. `null` para lista vazia (sem amostras). */
export function average(valores: number[]): number | null {
  if (valores.length === 0) return null
  const soma = valores.reduce((a, b) => a + b, 0)
  return Math.round((soma / valores.length) * 100) / 100
}
