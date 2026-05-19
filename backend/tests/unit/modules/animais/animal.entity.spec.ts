import { describe, it, expect } from 'vitest'
import { Animal } from '@/modules/animais/domain/entities/animal.entity'

describe('Animal entity', () => {
  const clienteId = crypto.randomUUID()

  describe('create', () => {
    it('cria animal com dados válidos', () => {
      const a = Animal.create({ nome: 'Rex', clienteId, especie: 'Cão' })
      expect(a.nome).toBe('Rex')
      expect(a.especie).toBe('Cão')
      expect(a.sexo).toBe('Indefinido')
      expect(a.isActive).toBe(true)
    })

    it('rejeita espécie inválida', () => {
      expect(() => Animal.create({ nome: 'Rex', clienteId, especie: 'Hamster' })).toThrow(
        'Espécie inválida',
      )
    })

    it('rejeita sexo inválido', () => {
      expect(() =>
        Animal.create({ nome: 'Rex', clienteId, especie: 'Gato', sexo: 'X' }),
      ).toThrow('Sexo inválido')
    })
  })

  describe('idadeCalculada', () => {
    it('retorna null quando nascimento não informado', () => {
      const a = Animal.create({ nome: 'Rex', clienteId, especie: 'Cão' })
      expect(a.idadeCalculada).toBeNull()
    })

    it('retorna anos e meses quando nascimento informado', () => {
      const nascimento = new Date()
      nascimento.setFullYear(nascimento.getFullYear() - 2)
      nascimento.setMonth(nascimento.getMonth() - 3)
      const a = Animal.create({ nome: 'Rex', clienteId, especie: 'Cão', nascimento })
      expect(a.idadeCalculada).toMatchObject({ anos: 2, meses: 3 })
    })
  })

  describe('softDelete', () => {
    it('marca deletedAt e isActive fica false', () => {
      const a = Animal.create({ nome: 'Rex', clienteId, especie: 'Cão' })
      a.softDelete()
      expect(a.isActive).toBe(false)
    })
  })
})
