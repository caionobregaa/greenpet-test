import { describe, it, expect } from 'vitest'
import { Orcamento, MOTIVOS_PERDA, type MotivoPerda } from '@/modules/orcamentos/domain/entities/orcamento.entity'

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
    it('cria orçamento com status aberto por padrão', () => {
      const o = makeOrcamento()
      expect(o.status).toBe('aberto')
      expect(o.total).toBe(100)
      expect(o.descontoRecompraAplicado).toBe(false)
    })

    it('lança VALIDATION_ERROR ao criar direto como perdido sem motivoPerda', () => {
      let err: unknown
      try { makeOrcamento({ status: 'perdido' }) } catch (e) { err = e }
      expect((err as { code?: string })?.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('transições de status', () => {
    it('aberto → fechado', () => {
      const o = makeOrcamento()
      o.fechar()
      expect(o.status).toBe('fechado')
    })

    it.each(MOTIVOS_PERDA)('aberto → perdido com motivo "%s"', (motivo) => {
      const o = makeOrcamento()
      o.perder(motivo as MotivoPerda)
      expect(o.status).toBe('perdido')
      expect(o.motivoPerda).toBe(motivo)
    })

    it('perder() sem motivo lança MOTIVO_PERDA_INVALIDO', () => {
      const o = makeOrcamento()
      let err: unknown
      try { o.perder(undefined as unknown as MotivoPerda) } catch (e) { err = e }
      expect((err as { code?: string })?.code).toBe('MOTIVO_PERDA_INVALIDO')
    })

    it('perder() com motivo inválido lança MOTIVO_PERDA_INVALIDO', () => {
      const o = makeOrcamento()
      let err: unknown
      try { o.perder('Motivo qualquer' as unknown as MotivoPerda) } catch (e) { err = e }
      expect((err as { code?: string })?.code).toBe('MOTIVO_PERDA_INVALIDO')
    })

    it('perdido → aberto (reabrir) limpa o motivoPerda', () => {
      const o = makeOrcamento()
      o.perder('Preço')
      o.reabrir()
      expect(o.status).toBe('aberto')
      expect(o.motivoPerda).toBeUndefined()
    })

    it('fechado → aberto lança INVALID_STATUS_TRANSITION', () => {
      const o = makeOrcamento()
      o.fechar()
      let err: unknown
      try { o.reabrir() } catch (e) { err = e }
      expect((err as { code?: string })?.code).toBe('INVALID_STATUS_TRANSITION')
    })

    it('fechado → perdido lança INVALID_STATUS_TRANSITION', () => {
      const o = makeOrcamento()
      o.fechar()
      let err: unknown
      try { o.perder('Preço') } catch (e) { err = e }
      expect((err as { code?: string })?.code).toBe('INVALID_STATUS_TRANSITION')
    })

    it('perdido → fechado lança INVALID_STATUS_TRANSITION', () => {
      const o = makeOrcamento()
      o.perder('Preço')
      let err: unknown
      try { o.fechar() } catch (e) { err = e }
      expect((err as { code?: string })?.code).toBe('INVALID_STATUS_TRANSITION')
    })
  })

  describe('vencido', () => {
    it('retorna true quando validade é passada e status é aberto', () => {
      const o = makeOrcamento({ validade: new Date(Date.now() - 1000) })
      expect(o.vencido).toBe(true)
    })

    it('retorna false quando validade é futura', () => {
      const o = makeOrcamento()
      expect(o.vencido).toBe(false)
    })

    it('retorna false quando status é fechado (já convertido)', () => {
      const o = makeOrcamento({ validade: new Date(Date.now() - 1000) })
      o.fechar()
      expect(o.vencido).toBe(false)
    })
  })

  describe('desconto de recompra', () => {
    it('update() registra descontoRecompraAplicado e valorDescontoRecompra', () => {
      const o = makeOrcamento()
      o.update({ descontoRecompraAplicado: true, valorDescontoRecompra: 15 })
      expect(o.descontoRecompraAplicado).toBe(true)
      expect(o.valorDescontoRecompra).toBe(15)
    })
  })
})
