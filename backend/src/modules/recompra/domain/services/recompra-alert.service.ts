export type UrgencyLevel = 'vencido' | 'urgente' | 'proximo' | 'ok'

export function classifyUrgency(diasRestantes: number): UrgencyLevel {
  if (diasRestantes < 0) return 'vencido'
  if (diasRestantes <= 3) return 'urgente'
  if (diasRestantes <= 7) return 'proximo'
  return 'ok'
}

export function calcDiasRestantes(ultimaCompra: Date, diasRecompra: number): number {
  const proximaCompra = new Date(ultimaCompra)
  proximaCompra.setDate(proximaCompra.getDate() + diasRecompra)
  const hoje = new Date()
  const diffMs = proximaCompra.getTime() - hoje.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}
