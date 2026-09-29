import { describe, it, expect } from 'vitest'
import { parseTermosBusca } from '@/modules/produtos/infrastructure/repositories/produto-busca'

describe('parseTermosBusca', () => {
  it('divide a busca em palavras, ignorando espaços extras', () => {
    expect(parseTermosBusca('  fresh   frango ')).toEqual(['fresh', 'frango'])
  })

  it('retorna lista vazia para busca ausente, vazia ou só com espaços', () => {
    expect(parseTermosBusca(undefined)).toEqual([])
    expect(parseTermosBusca('')).toEqual([])
    expect(parseTermosBusca('   ')).toEqual([])
  })

  it('mantém o SKU como uma palavra só', () => {
    expect(parseTermosBusca('RAC-0100')).toEqual(['RAC-0100'])
  })

  it('escapa % e _ para não funcionarem como curinga do LIKE', () => {
    expect(parseTermosBusca('100% frango_x')).toEqual(['100\\%', 'frango\\_x'])
  })

  it('escapa a barra invertida', () => {
    expect(parseTermosBusca('a\\b')).toEqual(['a\\\\b'])
  })

  it('limita a 10 palavras', () => {
    expect(parseTermosBusca('a b c d e f g h i j k l')).toHaveLength(10)
  })
})
