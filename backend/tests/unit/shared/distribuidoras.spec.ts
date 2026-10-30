import { describe, it, expect } from 'vitest'
import { normalizarDistribuidora } from '@/shared/domain/distribuidoras'
import { Compra } from '@/modules/compras/domain/entities/compra.entity'

// specs/produtos/spec-v5.md — lista oficial de distribuidoras

describe('normalizarDistribuidora', () => {
  it.each([
    ['zoo center', 'ZOOCENTER'], ['Zoo Center', 'ZOOCENTER'], ['ZOOCENTER', 'ZOOCENTER'], ['Zoo-Center ', 'ZOOCENTER'],
    ['Prime', 'PRIME'], ['Market', 'MARKET'], ['Market/Prime', 'MARKET'], ['MARKET / PRIME', 'MARKET'], ['petz', 'PETZ'], ['Amazon', 'AMAZON'],
    ['dunort', 'DUNORTE'], ['Dunorte Distribuidora', 'DUNORTE'],
    ['Basso', 'BASSO PANCOTTE'], ['Basso Pancotte', 'BASSO PANCOTTE'], ['BASSO PACOTTE', 'BASSO PANCOTTE'], ['Basso & Pancotte', 'BASSO PANCOTTE'], ['Basso e Pancotte', 'BASSO PANCOTTE'],
    ['Agrominas', 'AGROMINAS'], ['Agro Minas', 'AGROMINAS'], ['Latidus', 'LATIDUS'],
    ['Central Pec', 'CENTRAL PEC'], ['CENTRALPEC', 'CENTRAL PEC'],
  ])('%s → %s', (entrada, oficial) => {
    expect(normalizarDistribuidora(entrada)).toBe(oficial)
  })

  it.each(['Amazon Prime', 'Zoo Centr', 'Outra Empresa', 'Energia'])('não altera nome fora das variações: %s', (nome) => {
    expect(normalizarDistribuidora(nome)).toBe(nome)
  })
})

describe('Compra — distribuidora', () => {
  const base = { dataPedido: new Date(), itens: [] as never[], totalManual: 10 }

  it('normaliza só em Produtos Pets, ao criar e editar', () => {
    const pets = Compra.create({ ...base, fornecedor: 'zoo center', categoria: 'Produtos Pets' })
    expect(pets.fornecedor).toBe('ZOOCENTER')
    pets.update({ fornecedor: 'market' })
    expect(pets.fornecedor).toBe('MARKET')

    const outra = Compra.create({ ...base, fornecedor: 'market', categoria: 'Marketing' })
    expect(outra.fornecedor).toBe('market')
    outra.update({ fornecedor: 'prime' })
    expect(outra.fornecedor).toBe('prime')
  })
})
