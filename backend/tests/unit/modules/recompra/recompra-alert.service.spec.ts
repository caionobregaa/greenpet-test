import { describe, it, expect } from 'vitest'
import { classifyUrgency } from '@/modules/recompra/domain/services/recompra-alert.service'

describe('recompra-alert.service — classifyUrgency', () => {
  it('retorna vencido quando diasRestantes < 0', () => {
    expect(classifyUrgency(-1)).toBe('vencido')
    expect(classifyUrgency(-100)).toBe('vencido')
  })

  it('retorna urgente quando diasRestantes está em [0, 3]', () => {
    expect(classifyUrgency(0)).toBe('urgente')
    expect(classifyUrgency(3)).toBe('urgente')
  })

  it('retorna proximo quando diasRestantes está em [4, 7]', () => {
    expect(classifyUrgency(4)).toBe('proximo')
    expect(classifyUrgency(7)).toBe('proximo')
  })

  it('retorna ok quando diasRestantes > 7', () => {
    expect(classifyUrgency(8)).toBe('ok')
    expect(classifyUrgency(30)).toBe('ok')
  })
})
