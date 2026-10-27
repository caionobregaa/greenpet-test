import { describe, it, expect } from 'vitest'
import { Orcamento } from '@/modules/orcamentos/domain/entities/orcamento.entity'
import { ConverterOrcamentoUseCase } from '@/modules/orcamentos/application/use-cases/converter-orcamento.use-case'
import { InMemoryOrcamentoRepository } from './fakes/in-memory-orcamento.repository'
import { InMemoryVendaRepository } from './fakes/in-memory-venda.repository'

// specs/orcamentos/spec-v5.md — brinde no orçamento

const validade = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

describe('Orçamento — brinde', () => {
  it('item brinde fica com valor, desconto e total zerados e fora do total (criar)', () => {
    const o = Orcamento.create({
      clienteId: crypto.randomUUID(),
      validade,
      itens: [
        { nome: 'Ração', qtd: 1, valorUnitario: 100 },
        { nome: 'Petisco', qtd: 2, valorUnitario: 15, desconto: 5, brinde: true },
      ],
    })
    expect(o.itens[1]).toMatchObject({ brinde: true, valorUnitario: 0, desconto: 0, total: 0 })
    expect(o.itens[0].brinde).toBe(false)
    expect(o.total).toBe(100)
  })

  it('editar os itens aplica a mesma regra', () => {
    const o = Orcamento.create({ clienteId: crypto.randomUUID(), validade, itens: [{ nome: 'Ração', qtd: 1, valorUnitario: 100 }] })
    o.update({ itens: [{ nome: 'Ração', qtd: 1, valorUnitario: 100 }, { nome: 'Brinquedo', qtd: 1, valorUnitario: 30, brinde: true }] })
    expect(o.itens[1]).toMatchObject({ brinde: true, valorUnitario: 0, total: 0 })
    expect(o.total).toBe(100)
  })

  it('converter em venda mantém o item como brinde', async () => {
    const orcamentoRepo = new InMemoryOrcamentoRepository()
    const vendaRepo = new InMemoryVendaRepository()
    const o = Orcamento.create({
      clienteId: crypto.randomUUID(),
      validade,
      itens: [{ nome: 'Ração', qtd: 1, valorUnitario: 100 }, { nome: 'Petisco', qtd: 1, valorUnitario: 0, brinde: true }],
    })
    await orcamentoRepo.save(o)
    const venda = await new ConverterOrcamentoUseCase(orcamentoRepo, vendaRepo).execute({ id: o.id, formaPag: 'Pix' })
    expect(venda.itens[1]).toMatchObject({ nome: 'Petisco', brinde: true, total: 0 })
    expect(venda.total).toBe(100)
  })
})
