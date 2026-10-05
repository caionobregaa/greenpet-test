export type UrgencyLevel = 'vencido' | 'urgente' | 'proximo' | 'ok'

export function classifyUrgency(diasRestantes: number): UrgencyLevel {
  if (diasRestantes < 0) return 'vencido'
  if (diasRestantes <= 3) return 'urgente'
  if (diasRestantes <= 7) return 'proximo'
  return 'ok'
}

// specs/recompra/spec-v2.md
/** Alerta de aviso (aba Avisos / card do Dashboard): faltam até 10 dias ou já venceu. */
export const DIAS_ALERTA_AVISO = 10
/** Cliente "sumido": venceu há mais desse tanto de dias. Confirmado com o usuário — corte de 30 dias. */
export const DIAS_ATRASO_SUMIDO = 30

export function isAlertaAviso(diasRestantes: number): boolean {
  return diasRestantes <= DIAS_ALERTA_AVISO
}

export function isSumido(diasRestantes: number): boolean {
  return diasRestantes < -DIAS_ATRASO_SUMIDO
}

export const MOTIVOS_SUMIDO = [
  'Preço',
  'Comprou em outro lugar',
  'Trocou de produto/ração',
  'Animal faleceu/foi doado',
  'Mudou de cidade',
  'Insatisfeito com produto/atendimento',
  'Ainda tem produto em casa',
  'Não respondeu',
  'Outro',
] as const
export type MotivoSumido = (typeof MOTIVOS_SUMIDO)[number]

/**
 * Valida os motivos de um cliente sumido: ≥1 motivo, todos da lista, sem repetição,
 * e `Outro` exige texto. Retorna a mensagem de erro, ou null se estiver válido.
 */
export function validarMotivosSumido(motivos: string[], outroTexto?: string | null): string | null {
  if (motivos.length === 0) return 'Selecione pelo menos um motivo'
  const invalido = motivos.find((m) => !(MOTIVOS_SUMIDO as readonly string[]).includes(m))
  if (invalido) return `Motivo inválido: ${invalido}`
  if (new Set(motivos).size !== motivos.length) return 'Motivo repetido'
  if (motivos.includes('Outro') && !outroTexto?.trim()) return 'Descreva o motivo em "Outro"'
  return null
}

export function calcDiasRestantes(ultimaCompra: Date, diasRecompra: number): number {
  const proximaCompra = new Date(ultimaCompra)
  proximaCompra.setDate(proximaCompra.getDate() + diasRecompra)
  const hoje = new Date()
  const diffMs = proximaCompra.getTime() - hoje.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}
