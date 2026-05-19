import { describe, it, expect } from 'vitest'
import { Compra } from '@/modules/compras/domain/entities/compra.entity'

describe('Compra entity', () => {
  function makeCompra() {
    return Compra.create({
      fornecedor: 'Fornecedor ABC',
      itens: [{ nome: 'Ração 15kg', qtd: 10, valorUnitario: 80 }],
    })
  }

  describe('create', () => {
    it('cria compra com status pendente e total calculado', () => {
      const c = makeCompra()
      expect(c.status).toBe('pendente')
      expect(c.total).toBe(800)
      expect(c.fornecedor).toBe('Fornecedor ABC')
    })
  })

  describe('transições de status', () => {
    it('pendente → confirmado', () => {
      const c = makeCompra()
      c.confirmar()
      expect(c.status).toBe('confirmado')
    })

    it('confirmado → recebido', () => {
      const c = makeCompra()
      c.confirmar()
      c.receber()
      expect(c.status).toBe('recebido')
    })

    it('pendente → cancelado', () => {
      const c = makeCompra()
      c.cancelar()
      expect(c.status).toBe('cancelado')
    })

    it('confirmado não pode ser cancelado', () => {
      const c = makeCompra()
      c.confirmar()
      let err: unknown
      try { c.cancelar() } catch (e) { err = e }
      expect((err as { code?: string })?.code).toBe('INVALID_STATUS_TRANSITION')
    })

    it('recebido não pode ser editado', () => {
      const c = makeCompra()
      c.confirmar()
      c.receber()
      let err: unknown
      try { c.assertEditavel() } catch (e) { err = e }
      expect((err as { code?: string })?.code).toBe('CANNOT_EDIT')
    })
  })

  describe('assertEditavel', () => {
    it('pendente é editável', () => {
      const c = makeCompra()
      expect(() => c.assertEditavel()).not.toThrow()
    })

    it('confirmado não é editável', () => {
      const c = makeCompra()
      c.confirmar()
      let err: unknown
      try { c.assertEditavel() } catch (e) { err = e }
      expect((err as { code?: string })?.code).toBe('CANNOT_EDIT')
    })
  })
})
