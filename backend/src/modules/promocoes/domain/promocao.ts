import { ValidationError } from '@/shared/errors/validation.error.js'

// Regras em specs/promocoes/rules.md. Manaus não tem horário de verão: UTC−4 o ano todo.
const FUSO_MANAUS = '-04:00'
const FUSO_MANAUS_MS = 4 * 60 * 60 * 1000

export type SituacaoPromocao = 'agendada' | 'ativa' | 'encerrada'

/** 00:00 do dia em Manaus. */
export function inicioDoDia(data: string): Date {
  return new Date(`${data}T00:00:00.000${FUSO_MANAUS}`)
}

/** 23:59:59.999 do dia em Manaus. */
export function fimDoDia(data: string): Date {
  return new Date(`${data}T23:59:59.999${FUSO_MANAUS}`)
}

/** Data (AAAA-MM-DD) do instante no horário de Manaus. */
export function dataManaus(instante: Date): string {
  return new Date(instante.getTime() - FUSO_MANAUS_MS).toISOString().slice(0, 10)
}

export function situacaoPromocao(periodo: { inicio: Date; fim: Date }, agora: Date = new Date()): SituacaoPromocao {
  if (agora < periodo.inicio) return 'agendada'
  if (agora > periodo.fim) return 'encerrada'
  return 'ativa'
}

export function validarPeriodo(inicio: string, fim: string): { inicio: Date; fim: Date } {
  const periodo = { inicio: inicioDoDia(inicio), fim: fimDoDia(fim) }
  if (Number.isNaN(periodo.inicio.getTime()) || Number.isNaN(periodo.fim.getTime())) {
    throw new ValidationError('VALIDATION_ERROR', 'Datas da promoção inválidas')
  }
  if (periodo.fim < periodo.inicio) {
    throw new ValidationError('VALIDATION_ERROR', 'A data de fim não pode ser antes da data de início')
  }
  return periodo
}

export function percentualDesconto(valorVenda: number, valorPromocional: number): number {
  if (valorVenda <= 0) return 0
  return Math.round((1 - valorPromocional / valorVenda) * 100)
}

export function formatarData(data: string): string {
  const [a, m, d] = data.split('-')
  return `${d}/${m}/${a}`
}
