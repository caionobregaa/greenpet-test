import { describe, it, expect } from 'vitest'
import { Orcamento } from '@/modules/orcamentos/domain/entities/orcamento.entity'

describe('Orcamento entity', () => {
  const clienteId = crypto.randomUUID()

  function makeOrcamento(overrides?: Record<string, unknown>) {
    return Orcamento.create({
      clienteId,
      validade: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      itens: [{ nome: 'Ração', qtd: 1, valorUnitario: 100 }],
      ...overrides,
    })
  }

  describe('create', () => {
    it('cria orçamento com status pendente por padrão', () => {
      const o = makeOrcamento()
      expect(o.status).toBe('pendente')
      expect(o.total).toBe(100)
    })
  })

  describe('transições de status', () => {
    it('pendente → aprovado', () => {
      const o = makeOrcamento()
      o.aprovar()
      expect(o.status).toBe('aprovado')
    })

    it('pendente → recusado', () => {
      const o = makeOrcamento()
      o.recusar()
      expect(o.status).toBe('recusado')
    })

    it('recusado → pendente (reabrir)', () => {
      const o = makeOrcamento()
      o.recusar()
      o.reabrir()
      expect(o.status).toBe('pendente')
    })

    it('aprovado → pendente lança INVALID_STATUS_TRANSITION', () => {
      const o = makeOrcamento()
      o.aprovar()
      let err: unknown
      try { o.reabrir() } catch (e) { err = e }
      expect((err as { code?: string })?.code).toBe('INVALID_STATUS_TRANSITION')
    })

    it('aprovado → recusado lança INVALID_STATUS_TRANSITION', () => {
      const o = makeOrcamento()
      o.aprovar()
      let err: unknown
      try { o.recusar() } catch (e) { err = e }
      expect((err as { code?: string })?.code).toBe('INVALID_STATUS_TRANSITION')
    })
  })

  describe('vencido', () => {
    it('retorna true quando validade é passada e status é pendente', () => {
      const o = makeOrcamento({ validade: new Date(Date.now() - 1000) })
      expect(o.vencido).toBe(true)
    })

    it('retorna false quando validade é futura', () => {
      const o = makeOrcamento()
      expect(o.vencido).toBe(false)
    })

    it('retorna false quando status é aprovado (já convertido)', () => {
      const o = makeOrcamento({ validade: new Date(Date.now() - 1000) })
      o.aprovar()
      expect(o.vencido).toBe(false)
    })
  })
})
