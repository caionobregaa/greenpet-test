import { describe, it, expect } from 'vitest'
import { previousPeriodRange, calcVariacaoPercentual } from '@/modules/dashboard/domain/services/period-comparison.service'

describe('period-comparison.service', () => {
  describe('previousPeriodRange', () => {
    it('período de 1 dia — anterior é o dia imediatamente antes', () => {
      const inicio = new Date('2026-09-10T00:00:00.000Z')
      const fim = new Date('2026-09-10T23:59:59.999Z')
      const anterior = previousPeriodRange(inicio, fim)
      expect(anterior.fim.toISOString().slice(0, 10)).toBe('2026-09-09')
      expect(anterior.inicio.toISOString().slice(0, 10)).toBe('2026-09-09')
    })

    it('período de 1 mês (30 dias) — anterior tem a mesma duração', () => {
      const inicio = new Date('2026-09-01T00:00:00.000Z')
      const fim = new Date('2026-09-30T23:59:59.999Z')
      const anterior = previousPeriodRange(inicio, fim)
      const duracaoAtual = fim.getTime() - inicio.getTime()
      const duracaoAnterior = anterior.fim.getTime() - anterior.inicio.getTime()
      expect(Math.round(duracaoAnterior / 1000)).toBe(Math.round(duracaoAtual / 1000))
      expect(anterior.fim < inicio).toBe(true)
    })

    it('período cruzando virada de ano', () => {
      const inicio = new Date('2027-01-01T00:00:00.000Z')
      const fim = new Date('2027-01-05T23:59:59.999Z')
      const anterior = previousPeriodRange(inicio, fim)
      expect(anterior.fim.toISOString().slice(0, 10)).toBe('2026-12-31')
    })
  })

  describe('calcVariacaoPercentual', () => {
    it('calcula aumento percentual normal', () => {
      expect(calcVariacaoPercentual(150, 100)).toBe(50)
    })

    it('calcula queda percentual normal', () => {
      expect(calcVariacaoPercentual(50, 100)).toBe(-50)
    })

    it('retorna null quando não há base de comparação (anterior = 0)', () => {
      expect(calcVariacaoPercentual(100, 0)).toBeNull()
    })

    it('retorna -100 quando o valor atual cai a zero', () => {
      expect(calcVariacaoPercentual(0, 100)).toBe(-100)
    })

    it('lida com anterior negativo usando o valor absoluto como base', () => {
      // ex.: prejuízo de -100 para lucro de 50 é uma melhora de 150%
      expect(calcVariacaoPercentual(50, -100)).toBe(150)
    })
  })
})
