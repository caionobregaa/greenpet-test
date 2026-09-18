import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateOrcamentoStatusUseCase } from '@/modules/orcamentos/application/use-cases/update-orcamento-status.use-case'
import { Orcamento } from '@/modules/orcamentos/domain/entities/orcamento.entity'
import { InMemoryOrcamentoRepository } from './fakes/in-memory-orcamento.repository'

describe('UpdateOrcamentoStatusUseCase', () => {
  let repo: InMemoryOrcamentoRepository
  let useCase: UpdateOrcamentoStatusUseCase

  beforeEach(() => {
    repo = new InMemoryOrcamentoRepository()
    useCase = new UpdateOrcamentoStatusUseCase(repo)
  })

  function makeOrcamento() {
    return Orcamento.create({
      clienteId: crypto.randomUUID(),
      validade: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      itens: [{ nome: 'Ração', qtd: 1, valorUnitario: 100 }],
    })
  }

  it('fecha um orçamento aberto', async () => {
    const o = makeOrcamento()
    await repo.save(o)

    const result = await useCase.execute({ id: o.id, acao: 'fechar' })

    expect(result.status).toBe('fechado')
  })

  it('marca como perdido repassando o motivo para a entidade', async () => {
    const o = makeOrcamento()
    await repo.save(o)

    const result = await useCase.execute({ id: o.id, acao: 'perder', motivo: 'Comprou concorrente' })

    expect(result.status).toBe('perdido')
    expect(result.motivoPerda).toBe('Comprou concorrente')
  })

  it('lança MOTIVO_PERDA_INVALIDO ao perder sem motivo', async () => {
    const o = makeOrcamento()
    await repo.save(o)

    await expect(useCase.execute({ id: o.id, acao: 'perder' })).rejects.toMatchObject({ code: 'MOTIVO_PERDA_INVALIDO' })
  })

  it('reabre um orçamento perdido e limpa o motivo', async () => {
    const o = makeOrcamento()
    o.perder('Preço')
    await repo.save(o)

    const result = await useCase.execute({ id: o.id, acao: 'reabrir' })

    expect(result.status).toBe('aberto')
    expect(result.motivoPerda).toBeUndefined()
  })

  it('lança NOT_FOUND quando orçamento não existe', async () => {
    await expect(useCase.execute({ id: 'nao-existe', acao: 'fechar' })).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })
})
