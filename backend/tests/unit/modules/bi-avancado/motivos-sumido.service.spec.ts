import { describe, it, expect } from 'vitest'
import { contarMotivosSumido } from '@/modules/bi-avancado/domain/services/motivos-sumido.service'

describe('contarMotivosSumido', () => {
  it('sem registros', () => {
    expect(contarMotivosSumido([])).toEqual({ totalRegistros: 0, motivos: [] })
  })

  it('registro com 2 motivos conta 1 vez em cada; percentual sobre o total de registros', () => {
    const r = contarMotivosSumido([['Preço', 'Mudou de cidade'], ['Preço'], ['Não respondeu'], ['Preço']])
    expect(r.totalRegistros).toBe(4)
    expect(r.motivos).toEqual([
      { motivo: 'Preço', quantidade: 3, percentual: 75 },
      { motivo: 'Mudou de cidade', quantidade: 1, percentual: 25 },
      { motivo: 'Não respondeu', quantidade: 1, percentual: 25 },
    ])
  })
})
