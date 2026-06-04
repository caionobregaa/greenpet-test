import { describe, it, expect } from 'vitest'
import { Cliente } from '@/modules/clientes/domain/entities/cliente.entity'

describe('Cliente entity', () => {
  describe('create', () => {
    it('cria cliente com dados válidos mínimos', () => {
      const c = Cliente.create({ nome: 'João Silva', telefone: '(92) 9 8765-4321' })
      expect(c.nome).toBe('João Silva')
      expect(c.telefone).toBe('(92) 9 8765-4321')
      expect(c.cidade).toBe('Manaus')
      expect(c.isActive).toBe(true)
    })

    it('aceita e-mail e CPF opcionais', () => {
      const c = Cliente.create({
        nome: 'Maria',
        telefone: '(92) 3307-1000',
        email: 'maria@test.com',
        cpf: '529.982.247-25',
      })
      expect(c.email).toBe('maria@test.com')
      expect(c.cpf).toBe('529.982.247-25')
    })

    it('rejeita nome com menos de 3 caracteres', () => {
      expect(() => Cliente.create({ nome: 'Ab', telefone: '(92) 9 8765-4321' })).toThrow(
        'Nome deve ter ao menos 3 caracteres',
      )
    })

    it('rejeita telefone inválido', () => {
      expect(() => Cliente.create({ nome: 'João', telefone: '929876' })).toThrow(
        'Telefone inválido',
      )
    })

    it('rejeita e-mail inválido quando fornecido', () => {
      expect(() =>
        Cliente.create({ nome: 'João', telefone: '(92) 9 8765-4321', email: 'invalido' }),
      ).toThrow('E-mail inválido')
    })

    it('rejeita CPF inválido quando fornecido', () => {
      expect(() =>
        Cliente.create({ nome: 'João', telefone: '(92) 9 8765-4321', cpf: '111.111.111-11' }),
      ).toThrow('CPF inválido')
    })

    it('usa cidade Manaus como padrão', () => {
      const c = Cliente.create({ nome: 'Ana', telefone: '(92) 9 1234-5678' })
      expect(c.cidade).toBe('Manaus')
    })

    it('numeroDeAnimais retorna 0 por padrão', () => {
      const c = Cliente.create({ nome: 'Ana', telefone: '(92) 9 1234-5678' })
      expect(c.numeroDeAnimais).toBe(0)
    })

    it('numeroDeAnimais retorna valor passado no create', () => {
      const c = Cliente.create({ nome: 'Ana', telefone: '(92) 9 1234-5678', numeroDeAnimais: 3 })
      expect(c.numeroDeAnimais).toBe(3)
    })
  })

  describe('softDelete', () => {
    it('marca deletedAt e isActive fica false', () => {
      const c = Cliente.create({ nome: 'João', telefone: '(92) 9 8765-4321' })
      c.softDelete()
      expect(c.isActive).toBe(false)
      expect(c.deletedAt).toBeDefined()
    })

    it('é idempotente - chamar duas vezes não muda o deletedAt', () => {
      const c = Cliente.create({ nome: 'João', telefone: '(92) 9 8765-4321' })
      c.softDelete()
      const first = c.deletedAt
      c.softDelete()
      expect(c.deletedAt).toEqual(first)
    })
  })

  describe('update', () => {
    it('atualiza apenas os campos fornecidos', () => {
      const c = Cliente.create({ nome: 'João', telefone: '(92) 9 8765-4321' })
      c.update({ nome: 'João Atualizado' })
      expect(c.nome).toBe('João Atualizado')
      expect(c.telefone).toBe('(92) 9 8765-4321')
    })

    it('rejeita nome < 3 caracteres no update', () => {
      const c = Cliente.create({ nome: 'João', telefone: '(92) 9 8765-4321' })
      expect(() => c.update({ nome: 'Jo' })).toThrow('Nome deve ter ao menos 3 caracteres')
    })
  })
})
