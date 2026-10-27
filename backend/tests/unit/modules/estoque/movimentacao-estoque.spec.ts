import { describe, it, expect } from 'vitest'
import { distribuirBaixa, rotuloVenda } from '@/modules/estoque/infrastructure/movimentacao-estoque'

// specs/estoque/spec-v2.md — repartir o que foi tirado do estoque entre os itens do mesmo produto

describe('distribuirBaixa', () => {
  it('preenche os itens na ordem sem passar da quantidade de cada um', () => {
    expect(distribuirBaixa(5, [2, 3])).toEqual([2, 3])
    expect(distribuirBaixa(3, [2, 3])).toEqual([2, 1])
    expect(distribuirBaixa(0, [2, 3])).toEqual([0, 0])
  })

  it('sem itens não reparte nada', () => {
    expect(distribuirBaixa(4, [])).toEqual([])
  })
})

describe('rotuloVenda', () => {
  it('formata o número da venda', () => {
    expect(rotuloVenda(12)).toBe('V00012')
    expect(rotuloVenda(null)).toBe('sem número')
  })
})
