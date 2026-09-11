import { describe, it, expect } from 'vitest'
import { Produto } from '@/modules/produtos/domain/entities/produto.entity'

describe('Produto entity', () => {
  describe('create', () => {
    it('cria produto com dados válidos', () => {
      const p = Produto.create({
        nome: 'Ração Premium',
        sku: 'RAC-0001',
        categoria: 'Ração',
        valorVenda: 150,
        valorCusto: 90,
      })
      expect(p.nome).toBe('Ração Premium')
      expect(p.sku).toBe('RAC-0001')
      expect(p.valorVenda).toBe(150)
      expect(p.isActive).toBe(true)
    })

    it('rejeita valorVenda negativo', () => {
      expect(() =>
        Produto.create({ nome: 'Ração', sku: 'RAC-0001', categoria: 'Ração', valorVenda: -10 }),
      ).toThrow('Valor monetário não pode ser negativo')
    })

    it('rejeita categoria inválida', () => {
      expect(() =>
        Produto.create({ nome: 'Ração', sku: 'RAC-0001', categoria: 'Inválido', valorVenda: 10 }),
      ).toThrow('Categoria inválida')
    })

    it('rejeita SKU vazio', () => {
      expect(() =>
        Produto.create({ nome: 'Ração', sku: '', categoria: 'Ração', valorVenda: 10 }),
      ).toThrow('SKU é obrigatório')
    })
  })

  describe('update', () => {
    it('SKU é imutável — não muda mesmo se alguém tentar passá-lo no update', () => {
      const p = Produto.create({ nome: 'Ração', sku: 'RAC-0001', categoria: 'Ração', valorVenda: 10 })
      p.update({ nome: 'Ração Renomeada', sku: 'RAC-9999' } as unknown as Parameters<typeof p.update>[0])
      expect(p.sku).toBe('RAC-0001')
      expect(p.nome).toBe('Ração Renomeada')
    })

    it('SKU permanece o mesmo quando a categoria é alterada', () => {
      const p = Produto.create({ nome: 'Petisco', sku: 'PET-0001', categoria: 'Petisco', valorVenda: 10 })
      p.update({ categoria: 'Suplemento' })
      expect(p.categoria).toBe('Suplemento')
      expect(p.sku).toBe('PET-0001')
    })
  })

  describe('margemCalculada', () => {
    it('calcula margem corretamente: (venda - custo) / venda * 100', () => {
      const p = Produto.create({
        nome: 'Ração',
        sku: 'RAC-0001',
        categoria: 'Ração',
        valorVenda: 100,
        valorCusto: 60,
      })
      expect(p.margemCalculada).toBeCloseTo(40)
    })

    it('retorna 0 quando valorVenda é 0', () => {
      const p = Produto.create({ nome: 'Ração', sku: 'RAC-0001', categoria: 'Ração', valorVenda: 0 })
      expect(p.margemCalculada).toBe(0)
    })
  })

  describe('estoqueMinimo', () => {
    it('fica undefined quando não informado', () => {
      const p = Produto.create({ nome: 'Ração', sku: 'RAC-0001', categoria: 'Ração', valorVenda: 10 })
      expect(p.estoqueMinimo).toBeUndefined()
    })

    it('aceita valor na criação', () => {
      const p = Produto.create({ nome: 'Ração', sku: 'RAC-0001', categoria: 'Ração', valorVenda: 10, estoqueMinimo: 5 })
      expect(p.estoqueMinimo).toBe(5)
    })

    it('pode ser definido e removido via update', () => {
      const p = Produto.create({ nome: 'Ração', sku: 'RAC-0001', categoria: 'Ração', valorVenda: 10 })
      p.update({ estoqueMinimo: 8 })
      expect(p.estoqueMinimo).toBe(8)
      p.update({ estoqueMinimo: null })
      expect(p.estoqueMinimo).toBeUndefined()
    })
  })

  describe('softDelete', () => {
    it('marca deletedAt e isActive fica false', () => {
      const p = Produto.create({ nome: 'Ração', sku: 'RAC-0001', categoria: 'Ração', valorVenda: 10 })
      p.softDelete()
      expect(p.isActive).toBe(false)
    })
  })
})
