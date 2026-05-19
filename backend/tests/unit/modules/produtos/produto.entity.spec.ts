import { describe, it, expect } from 'vitest'
import { Produto } from '@/modules/produtos/domain/entities/produto.entity'

describe('Produto entity', () => {
  describe('create', () => {
    it('cria produto com dados válidos', () => {
      const p = Produto.create({
        nome: 'Ração Premium',
        categoria: 'Ração',
        valorVenda: 150,
        valorCusto: 90,
      })
      expect(p.nome).toBe('Ração Premium')
      expect(p.valorVenda).toBe(150)
      expect(p.isActive).toBe(true)
    })

    it('rejeita valorVenda negativo', () => {
      expect(() =>
        Produto.create({ nome: 'Ração', categoria: 'Ração', valorVenda: -10 }),
      ).toThrow('Valor monetário não pode ser negativo')
    })

    it('rejeita categoria inválida', () => {
      expect(() =>
        Produto.create({ nome: 'Ração', categoria: 'Inválido', valorVenda: 10 }),
      ).toThrow('Categoria inválida')
    })
  })

  describe('margemCalculada', () => {
    it('calcula margem corretamente: (venda - custo) / venda * 100', () => {
      const p = Produto.create({
        nome: 'Ração',
        categoria: 'Ração',
        valorVenda: 100,
        valorCusto: 60,
      })
      expect(p.margemCalculada).toBeCloseTo(40)
    })

    it('retorna 0 quando valorVenda é 0', () => {
      const p = Produto.create({ nome: 'Ração', categoria: 'Ração', valorVenda: 0 })
      expect(p.margemCalculada).toBe(0)
    })
  })

  describe('softDelete', () => {
    it('marca deletedAt e isActive fica false', () => {
      const p = Produto.create({ nome: 'Ração', categoria: 'Ração', valorVenda: 10 })
      p.softDelete()
      expect(p.isActive).toBe(false)
    })
  })
})
