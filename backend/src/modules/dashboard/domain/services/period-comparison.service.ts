/**
 * Calcula o período anterior equivalente (mesma duração, imediatamente antes
 * de `inicio`) e a variação percentual entre um valor atual e um valor de
 * referência — usado para os badges "vs período anterior" da aba de BI.
 */

export function previousPeriodRange(inicio: Date, fim: Date): { inicio: Date; fim: Date } {
  // Span inclusivo (ex.: 00:00:00.000 até 23:59:59.999 do mesmo dia = 1 dia
  // cheio, não "quase 1 dia"). anteriorFim é o instante logo antes de `inicio`,
  // e anteriorInicio recua o mesmo span a partir dali — período contíguo,
  // sem sobreposição, com exatamente a mesma duração do período atual.
  const spanMs = fim.getTime() - inicio.getTime() + 1
  const anteriorFim = new Date(inicio.getTime() - 1)
  const anteriorInicio = new Date(anteriorFim.getTime() - spanMs + 1)
  return { inicio: anteriorInicio, fim: anteriorFim }
}

/**
 * Retorna a variação percentual de `anterior` para `atual`, arredondada a 2
 * casas decimais. `null` quando não há base de comparação (`anterior === 0`)
 * — evita mostrar `Infinity` ou um percentual sem sentido na UI.
 */
export function calcVariacaoPercentual(atual: number, anterior: number): number | null {
  if (anterior === 0) return null
  const variacao = ((atual - anterior) / Math.abs(anterior)) * 100
  return Math.round(variacao * 100) / 100
}
