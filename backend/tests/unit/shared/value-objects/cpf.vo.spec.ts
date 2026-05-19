import { describe, it, expect } from 'vitest'
import { CPF } from '@/shared/domain/value-objects/cpf.vo'

describe('CPF', () => {
  describe('create', () => {
    it('aceita CPF válido formatado', () => {
      const cpf = CPF.create('529.982.247-25')
      expect(cpf.value).toBe('529.982.247-25')
    })

    it('aceita CPF válido sem formatação (só dígitos)', () => {
      const cpf = CPF.create('52998224725')
      expect(cpf.value).toBe('529.982.247-25')
    })

    it('rejeita CPF com todos dígitos iguais', () => {
      expect(() => CPF.create('000.000.000-00')).toThrow('CPF inválido')
      expect(() => CPF.create('111.111.111-11')).toThrow('CPF inválido')
      expect(() => CPF.create('99999999999')).toThrow('CPF inválido')
    })

    it('rejeita CPF com dígito verificador errado', () => {
      expect(() => CPF.create('529.982.247-26')).toThrow('CPF inválido')
    })

    it('rejeita CPF com menos de 11 dígitos', () => {
      expect(() => CPF.create('123.456.789')).toThrow('CPF deve conter 11 dígitos')
    })

    it('rejeita CPF com mais de 11 dígitos', () => {
      expect(() => CPF.create('123.456.789-001')).toThrow('CPF deve conter 11 dígitos')
    })
  })

  describe('equals', () => {
    it('dois CPFs com o mesmo valor são iguais', () => {
      const a = CPF.create('529.982.247-25')
      const b = CPF.create('52998224725')
      expect(a.equals(b)).toBe(true)
    })

    it('dois CPFs com valores diferentes não são iguais', () => {
      const a = CPF.create('529.982.247-25')
      const b = CPF.create('111.444.777-35')
      expect(a.equals(b)).toBe(false)
    })
  })
})
