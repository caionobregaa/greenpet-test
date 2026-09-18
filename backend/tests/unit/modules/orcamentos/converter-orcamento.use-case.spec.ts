import { describe, it, expect, beforeEach } from 'vitest'
import { ConverterOrcamentoUseCase } from '@/modules/orcamentos/application/use-cases/converter-orcamento.use-case'
import { Orcamento } from '@/modules/orcamentos/domain/entities/orcamento.entity'
import { InMemoryOrcamentoRepository } from './fakes/in-memory-orcamento.repository'
import { InMemoryVendaRepository } from './fakes/in-memory-venda.repository'

describe('ConverterOrcamentoUseCase', () => {
  let orcamentoRepo: InMemoryOrcamentoRepository
  let vendaRepo: InMemoryVendaRepository
  let useCase: ConverterOrcamentoUseCase

  beforeEach(() => {
    orcamentoRepo = new InMemoryOrcamentoRepository()
    vendaRepo = new InMemoryVendaRepository()
    useCase = new ConverterOrcamentoUseCase(orcamentoRepo, vendaRepo)
  })

  function makeOrcamento(overrides?: Record<string, unknown>) {
    return Orcamento.create({
      clienteId: crypto.randomUUID(),
      validade: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      itens: [{ nome: 'Ração', qtd: 1, valorUnitario: 100 }],
      ...overrides,
    })
  }

  it('converte um orçamento aberto em venda e marca o orçamento como fechado', async () => {
    const o = makeOrcamento()
    await orcamentoRepo.save(o)

    const venda = await useCase.execute({ id: o.id, formaPag: 'Pix' })

    const atualizado = await orcamentoRepo.findById(o.id)
    expect(atualizado!.status).toBe('fechado')
    expect(atualizado!.vendaId).toBe(venda.id)
  })

  it('lança ALREADY_CONVERTED quando o orçamento já está fechado com vendaId', async () => {
    const o = makeOrcamento()
    o.vincularVenda(crypto.randomUUID())
    await orcamentoRepo.save(o)

    await expect(useCase.execute({ id: o.id, formaPag: 'Pix' })).rejects.toMatchObject({ code: 'ALREADY_CONVERTED' })
  })

  it('lança INVALID_STATUS quando o orçamento está perdido', async () => {
    const o = makeOrcamento()
    o.perder('Preço')
    await orcamentoRepo.save(o)

    await expect(useCase.execute({ id: o.id, formaPag: 'Pix' })).rejects.toMatchObject({ code: 'INVALID_STATUS' })
  })

  it('lança MISSING_CLIENTE quando o orçamento não tem cliente', async () => {
    const o = makeOrcamento({ clienteId: undefined })
    await orcamentoRepo.save(o)

    await expect(useCase.execute({ id: o.id, formaPag: 'Pix' })).rejects.toMatchObject({ code: 'MISSING_CLIENTE' })
  })
})
