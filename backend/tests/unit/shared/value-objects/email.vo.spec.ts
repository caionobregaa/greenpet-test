import { describe, it, expect } from 'vitest'
import { Email } from '@/shared/domain/value-objects/email.vo'

describe('Email', () => {
  describe('create', () => {
    it('aceita e-mail válido', () => {
      const email = Email.create('joao@example.com')
      expect(email.value).toBe('joao@example.com')
    })

    it('normaliza para minúsculas', () => {
      const email = Email.create('JOAO@EXAMPLE.COM')
      expect(email.value).toBe('joao@example.com')
    })

    it('remove espaços', () => {
      const email = Email.create('  joao@example.com  ')
      expect(email.value).toBe('joao@example.com')
    })

    it('rejeita e-mail sem @', () => {
      expect(() => Email.create('joaoexample.com')).toThrow('E-mail inválido')
    })

    it('rejeita e-mail sem domínio', () => {
      expect(() => Email.create('joao@')).toThrow('E-mail inválido')
    })

    it('rejeita string vazia', () => {
      expect(() => Email.create('')).toThrow('E-mail inválido')
    })
  })
})
