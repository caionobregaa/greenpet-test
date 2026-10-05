export interface MotivoSumidoContagem {
  motivo: string
  quantidade: number
  percentual: number
}

export interface MotivosClientesSumidos {
  totalRegistros: number
  motivos: MotivoSumidoContagem[]
}

/**
 * Conta os motivos dos clientes sumidos (specs/bi-avancado/spec-v3.md). Cada registro
 * pode citar vários motivos; `percentual` é relativo ao total de registros, então a
 * soma pode passar de 100%.
 */
export function contarMotivosSumido(registros: string[][]): MotivosClientesSumidos {
  const contagem = new Map<string, number>()
  for (const motivos of registros) {
    for (const motivo of new Set(motivos)) contagem.set(motivo, (contagem.get(motivo) ?? 0) + 1)
  }
  const total = registros.length
  const motivos = Array.from(contagem.entries())
    .map(([motivo, quantidade]) => ({
      motivo,
      quantidade,
      percentual: total > 0 ? Math.round((quantidade / total) * 100 * 100) / 100 : 0,
    }))
    .sort((a, b) => b.quantidade - a.quantidade || a.motivo.localeCompare(b.motivo, 'pt-BR'))
  return { totalRegistros: total, motivos }
}
