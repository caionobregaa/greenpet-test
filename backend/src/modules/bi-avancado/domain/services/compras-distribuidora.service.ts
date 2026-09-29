export interface CompraDistribuidora {
  fornecedor: string
  mes: string // YYYY-MM
  total: number
}

export interface DistribuidoraMensal {
  fornecedor: string
  total: number
  porMes: Record<string, number>
}

export interface ComprasDistribuidoraMensal {
  meses: string[]
  distribuidoras: DistribuidoraMensal[]
  totaisPorMes: Record<string, number>
}

const arredondar = (v: number) => Math.round(v * 100) / 100

/**
 * Consolida compras em uma matriz distribuidora × mês (specs/bi-avancado/spec-v2.md).
 * Todos os `meses` aparecem em cada linha (0 quando não houve compra); compras fora
 * de `meses` são ignoradas. Distribuidoras ordenadas pelo total decrescente.
 */
export function montarComprasPorDistribuidoraMensal(
  meses: string[],
  compras: CompraDistribuidora[],
): ComprasDistribuidoraMensal {
  const zerado = () => Object.fromEntries(meses.map((m) => [m, 0])) as Record<string, number>
  const porFornecedor = new Map<string, Record<string, number>>()
  const totaisPorMes = zerado()

  for (const c of compras) {
    if (!(c.mes in totaisPorMes)) continue
    const linha = porFornecedor.get(c.fornecedor) ?? zerado()
    linha[c.mes] = arredondar(linha[c.mes] + c.total)
    porFornecedor.set(c.fornecedor, linha)
    totaisPorMes[c.mes] = arredondar(totaisPorMes[c.mes] + c.total)
  }

  const distribuidoras = Array.from(porFornecedor.entries())
    .map(([fornecedor, porMes]) => ({
      fornecedor,
      total: arredondar(Object.values(porMes).reduce((s, v) => s + v, 0)),
      porMes,
    }))
    .sort((a, b) => b.total - a.total || a.fornecedor.localeCompare(b.fornecedor, 'pt-BR'))

  return { meses, distribuidoras, totaisPorMes }
}
