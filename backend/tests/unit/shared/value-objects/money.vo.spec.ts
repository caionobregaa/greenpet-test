import { describe, it, expect } from 'vitest'
import { Money } from '@/shared/domain/value-objects/money.vo'

describe('Money', () => {
  describe('create', () => {
    it('cria valor monetário positivo', () => {
      const m = Money.create(100.5)
      expect(m.value).toBe(100.5)
    })

    it('aceita zero', () => {
      const m = Money.create(0)
      expect(m.value).toBe(0)
    })

    it('rejeita valor negativo', () => {
      expect(() => Money.create(-1)).toThrow('Valor monetário não pode ser negativo')
    })

    it('rejeita NaN', () => {
      expect(() => Money.create(NaN)).toThrow('Valor monetário deve ser um número')
    })

    it('arredonda para 2 casas decimais', () => {
      const m = Money.create(10.999)
      expect(m.value).toBe(11)
    })
  })

  describe('add', () => {
    it('soma dois valores corretamente', () => {
      const a = Money.create(10.5)
      const b = Money.create(5.5)
      expect(a.add(b).value).toBe(16)
    })
  })

  describe('multiply', () => {
    it('multiplica por quantidade', () => {
      const m = Money.create(25)
      expect(m.multiply(3).value).toBe(75)
    })
  })

  describe('toString', () => {
    it('retorna string com 2 casas decimais', () => {
      expect(Money.create(10).toString()).toBe('10.00')
    })
  })
})
