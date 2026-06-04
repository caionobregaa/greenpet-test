import { describe, it, expect } from 'vitest'
import { Phone } from '@/shared/domain/value-objects/phone.vo'

describe('Phone', () => {
  describe('create', () => {
    it('aceita celular no formato (99) 9 9999-9999', () => {
      const p = Phone.create('(92) 9 8765-4321')
      expect(p.value).toBe('(92) 9 8765-4321')
    })

    it('aceita fixo no formato (99) 9999-9999', () => {
      const p = Phone.create('(92) 3307-1000')
      expect(p.value).toBe('(92) 3307-1000')
    })

    it('rejeita número sem DDD', () => {
      expect(() => Phone.create('9 8765-4321')).toThrow('Telefone inválido')
    })

    it('aceita 11 dígitos brutos e formata como celular', () => {
      const p = Phone.create('92987654321')
      expect(p.value).toBe('(92) 9 8765-4321')
    })

    it('aceita 10 dígitos brutos e formata como fixo', () => {
      const p = Phone.create('9233071000')
      expect(p.value).toBe('(92) 3307-1000')
    })

    it('rejeita número com dígitos insuficientes', () => {
      expect(() => Phone.create('929876')).toThrow('Telefone inválido')
    })

    it('rejeita string vazia', () => {
      expect(() => Phone.create('')).toThrow('Telefone inválido')
    })
  })

  describe('equals', () => {
    it('dois telefones iguais retornam true', () => {
      const a = Phone.create('(92) 9 8765-4321')
      const b = Phone.create('(92) 9 8765-4321')
      expect(a.equals(b)).toBe(true)
    })

    it('dois telefones diferentes retornam false', () => {
      const a = Phone.create('(92) 9 8765-4321')
      const b = Phone.create('(92) 3307-1000')
      expect(a.equals(b)).toBe(false)
    })
  })
})
