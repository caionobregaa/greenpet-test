import { describe, it, expect } from 'vitest'
import { montarComprasPorDistribuidoraMensal } from '@/modules/bi-avancado/domain/services/compras-distribuidora.service'

const MESES = ['2026-07', '2026-08', '2026-09']

describe('montarComprasPorDistribuidoraMensal', () => {
  it('soma compras da mesma distribuidora no mesmo mês e preenche meses sem compra com 0', () => {
    const r = montarComprasPorDistribuidoraMensal(MESES, [
      { fornecedor: 'Market', mes: '2026-09', total: 100.1 },
      { fornecedor: 'Market', mes: '2026-09', total: 200.2 },
    ])
    expect(r.distribuidoras).toEqual([
      { fornecedor: 'Market', total: 300.3, porMes: { '2026-07': 0, '2026-08': 0, '2026-09': 300.3 } },
    ])
  })

  it('ordena distribuidoras pelo total decrescente', () => {
    const r = montarComprasPorDistribuidoraMensal(MESES, [
      { fornecedor: 'Basso', mes: '2026-07', total: 50 },
      { fornecedor: 'Zoo Center', mes: '2026-08', total: 500 },
      { fornecedor: 'Market', mes: '2026-09', total: 200 },
    ])
    expect(r.distribuidoras.map((d) => d.fornecedor)).toEqual(['Zoo Center', 'Market', 'Basso'])
  })

  it('totaisPorMes soma as distribuidoras de cada mês', () => {
    const r = montarComprasPorDistribuidoraMensal(MESES, [
      { fornecedor: 'Market', mes: '2026-08', total: 100 },
      { fornecedor: 'Basso', mes: '2026-08', total: 50 },
      { fornecedor: 'Basso', mes: '2026-09', total: 10 },
    ])
    expect(r.totaisPorMes).toEqual({ '2026-07': 0, '2026-08': 150, '2026-09': 10 })
    expect(r.meses).toEqual(MESES)
  })

  it('ignora compras fora dos meses da janela', () => {
    const r = montarComprasPorDistribuidoraMensal(MESES, [
      { fornecedor: 'Market', mes: '2026-03', total: 999 },
    ])
    expect(r.distribuidoras).toEqual([])
    expect(r.totaisPorMes).toEqual({ '2026-07': 0, '2026-08': 0, '2026-09': 0 })
  })
})
