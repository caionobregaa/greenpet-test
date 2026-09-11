import { describe, it, expect } from 'vitest'
import { uniqueSortedDates, consecutiveIntervalsDays, average } from '@/modules/bi-avancado/domain/services/recompra-cycle.service'

describe('recompra-cycle.service', () => {
  describe('uniqueSortedDates', () => {
    it('remove datas duplicadas do mesmo dia', () => {
      const datas = [new Date('2026-01-05T10:00:00Z'), new Date('2026-01-05T18:00:00Z')]
      expect(uniqueSortedDates(datas)).toHaveLength(1)
    })

    it('ordena datas fora de ordem', () => {
      const datas = [new Date('2026-03-01'), new Date('2026-01-01'), new Date('2026-02-01')]
      const resultado = uniqueSortedDates(datas)
      expect(resultado.map((d) => d.toISOString().slice(0, 10))).toEqual(['2026-01-01', '2026-02-01', '2026-03-01'])
    })
  })

  describe('consecutiveIntervalsDays', () => {
    it('calcula os intervalos entre datas consecutivas', () => {
      const datas = uniqueSortedDates([new Date('2026-01-01'), new Date('2026-01-31'), new Date('2026-03-02')])
      expect(consecutiveIntervalsDays(datas)).toEqual([30, 30])
    })

    it('retorna array vazio com menos de 2 datas', () => {
      expect(consecutiveIntervalsDays([new Date('2026-01-01')])).toEqual([])
      expect(consecutiveIntervalsDays([])).toEqual([])
    })
  })

  describe('average', () => {
    it('calcula a média simples', () => {
      expect(average([30, 30, 60])).toBe(40)
    })

    it('retorna null para lista vazia', () => {
      expect(average([])).toBeNull()
    })
  })
})
