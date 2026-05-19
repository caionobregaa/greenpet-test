import { describe, it, expect } from 'vitest'
import { Password } from '@/modules/auth/domain/value-objects/password.vo'

describe('Password VO', () => {
  describe('validate', () => {
    it('aceita senha com 8+ caracteres, 1 letra e 1 número', () => {
      expect(() => Password.validate('senha123')).not.toThrow()
    })

    it('rejeita senha com menos de 8 caracteres', () => {
      expect(() => Password.validate('abc1')).toThrow('Senha deve ter no mínimo 8 caracteres')
    })

    it('rejeita senha sem número', () => {
      expect(() => Password.validate('senhasemnum')).toThrow('Senha deve conter pelo menos 1 número')
    })

    it('rejeita senha sem letra', () => {
      expect(() => Password.validate('12345678')).toThrow('Senha deve conter pelo menos 1 letra')
    })
  })

  describe('fromHash', () => {
    it('cria VO a partir de hash existente sem validar', () => {
      const pwd = Password.fromHash('$2b$12$somehashvalue')
      expect(pwd.hash).toBe('$2b$12$somehashvalue')
    })
  })
})
