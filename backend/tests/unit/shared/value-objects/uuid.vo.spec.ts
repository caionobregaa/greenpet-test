import { describe, it, expect } from 'vitest'
import { UUID } from '@/shared/domain/value-objects/uuid.vo'

describe('UUID', () => {
  describe('create', () => {
    it('gera UUID v4 aleatório quando nenhum valor é passado', () => {
      const uuid = UUID.create()
      expect(uuid.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      )
    })

    it('aceita UUID v4 válido', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000'
      const uuid = UUID.create(id)
      expect(uuid.value).toBe(id)
    })

    it('rejeita string não UUID', () => {
      expect(() => UUID.create('nao-e-uuid')).toThrow('UUID inválido')
    })

    it('rejeita string vazia', () => {
      expect(() => UUID.create('')).toThrow('UUID inválido')
    })
  })

  describe('equals', () => {
    it('dois UUIDs com o mesmo valor são iguais', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000'
      expect(UUID.create(id).equals(UUID.create(id))).toBe(true)
    })

    it('dois UUIDs diferentes não são iguais', () => {
      const a = UUID.create()
      const b = UUID.create()
      expect(a.equals(b)).toBe(false)
    })
  })

  describe('toString', () => {
    it('retorna o valor como string', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000'
      expect(UUID.create(id).toString()).toBe(id)
    })
  })
})
