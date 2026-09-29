import { describe, it, expect } from 'vitest'
import { MES_REGEX, intervaloDoMes, ultimosMeses } from '@/shared/domain/mes'

describe('mes', () => {
  it('aceita só YYYY-MM com mês de 01 a 12', () => {
    expect(MES_REGEX.test('2026-09')).toBe(true)
    expect(MES_REGEX.test('2026-12')).toBe(true)
    expect(MES_REGEX.test('2026-13')).toBe(false)
    expect(MES_REGEX.test('2026-00')).toBe(false)
    expect(MES_REGEX.test('09-2026')).toBe(false)
    expect(MES_REGEX.test('2026-9')).toBe(false)
  })

  it('intervaloDoMes vai do dia 1 até o dia 1 do mês seguinte, em UTC', () => {
    expect(intervaloDoMes('2026-09')).toEqual({
      inicio: new Date('2026-09-01T00:00:00.000Z'),
      fim: new Date('2026-10-01T00:00:00.000Z'),
    })
  })

  it('intervaloDoMes vira o ano em dezembro', () => {
    expect(intervaloDoMes('2026-12').fim).toEqual(new Date('2027-01-01T00:00:00.000Z'))
  })

  it('ultimosMeses lista do mais antigo ao mês de referência', () => {
    expect(ultimosMeses(6, new Date(2026, 8, 29))).toEqual([
      '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09',
    ])
  })

  it('ultimosMeses atravessa a virada de ano', () => {
    expect(ultimosMeses(3, new Date(2026, 0, 15))).toEqual(['2025-11', '2025-12', '2026-01'])
  })
})
