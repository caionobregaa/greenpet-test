import { describe, it, expect, beforeEach } from 'vitest'
import { Venda } from '@/modules/vendas/domain/entities/venda.entity'
import { CreateVendaUseCase } from '@/modules/vendas/application/use-cases/create-venda.use-case'
import { UpdateVendaUseCase } from '@/modules/vendas/application/use-cases/update-venda.use-case'
import { RegistrarPagamentoVendaUseCase } from '@/modules/vendas/application/use-cases/registrar-pagamento-venda.use-case'
import { RemoverPagamentoVendaUseCase } from '@/modules/vendas/application/use-cases/remover-pagamento-venda.use-case'
import { ConverterOrcamentoUseCase } from '@/modules/orcamentos/application/use-cases/converter-orcamento.use-case'
import { Orcamento } from '@/modules/orcamentos/domain/entities/orcamento.entity'
import type { IClienteRepository } from '@/modules/clientes/domain/repositories/cliente.repository.interface'
import { InMemoryVendaRepository } from '../orcamentos/fakes/in-memory-venda.repository'
import { InMemoryOrcamentoRepository } from '../orcamentos/fakes/in-memory-orcamento.repository'

// specs/vendas/spec-v6.md — valor em aberto / pagamento parcial

const clienteId = crypto.randomUUID()
const clienteRepo = { findById: async () => ({ id: clienteId }) } as unknown as IClienteRepository
const itens = [{ nome: 'Ração', qtd: 1, valorUnitario: 200 }]

describe('Venda — valor em aberto', () => {
  let vendaRepo: InMemoryVendaRepository
  let createUC: CreateVendaUseCase

  beforeEach(() => {
    vendaRepo = new InMemoryVendaRepository()
    createUC = new CreateVendaUseCase(vendaRepo, clienteRepo)
  })

  it('venda criada sem valorRecebido fica quitada', async () => {
    const venda = await createUC.execute({ clienteId, formaPag: 'Pix', itens })
    expect(venda.valorRecebido).toBe(200)
    expect(venda.valorRecebidoInformado).toBeUndefined()
    expect(venda.valorPago).toBe(200)
    expect(venda.valorEmAberto).toBe(0)
  })

  it('venda criada com valorRecebido menor que o total deixa a diferença em aberto', async () => {
    const venda = await createUC.execute({ clienteId, formaPag: 'Pix', itens, valorRecebido: 50 })
    expect(venda.valorPago).toBe(50)
    expect(venda.valorEmAberto).toBe(150)
  })

  it('valorRecebido negativo ou maior que o total retorna VALIDATION_ERROR', async () => {
    await expect(createUC.execute({ clienteId, formaPag: 'Pix', itens, valorRecebido: -1 }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    await expect(createUC.execute({ clienteId, formaPag: 'Pix', itens, valorRecebido: 200.01 }))
      .rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(vendaRepo.items).toHaveLength(0)
  })

  it('registrar recebimento reduz o em aberto, inclusive em partes, até quitar', async () => {
    const venda = await createUC.execute({ clienteId, formaPag: 'Pix', itens, valorRecebido: 50 })
    const registrar = new RegistrarPagamentoVendaUseCase(vendaRepo)

    await registrar.execute({ vendaId: venda.id, valor: 100, formaPag: 'Dinheiro', data: new Date('2026-10-30T12:00:00Z'), obs: 'parte 1' })
    let atual = await vendaRepo.findById(venda.id)
    expect(atual!.valorEmAberto).toBe(50)
    expect(atual!.pagamentos[0]).toMatchObject({ valor: 100, formaPag: 'Dinheiro', obs: 'parte 1' })

    await registrar.execute({ vendaId: venda.id, valor: 50, formaPag: 'Pix' })
    atual = await vendaRepo.findById(venda.id)
    expect(atual!.valorEmAberto).toBe(0)
    expect(atual!.valorPago).toBe(200)
  })

  it('recebimento maior que o em aberto, zero ou com forma inválida retorna VALIDATION_ERROR', async () => {
    const venda = await createUC.execute({ clienteId, formaPag: 'Pix', itens, valorRecebido: 150 })
    const registrar = new RegistrarPagamentoVendaUseCase(vendaRepo)
    await expect(registrar.execute({ vendaId: venda.id, valor: 50.01, formaPag: 'Pix' })).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    await expect(registrar.execute({ vendaId: venda.id, valor: 0, formaPag: 'Pix' })).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    await expect(registrar.execute({ vendaId: venda.id, valor: 10, formaPag: 'Cheque' })).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    expect(venda.pagamentos).toHaveLength(0)
  })

  it('registrar recebimento em venda inexistente retorna NOT_FOUND', async () => {
    const registrar = new RegistrarPagamentoVendaUseCase(vendaRepo)
    await expect(registrar.execute({ vendaId: crypto.randomUUID(), valor: 10, formaPag: 'Pix' })).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('excluir recebimento devolve o valor ao em aberto; recebimento inexistente retorna NOT_FOUND', async () => {
    const venda = await createUC.execute({ clienteId, formaPag: 'Pix', itens, valorRecebido: 0 })
    await new RegistrarPagamentoVendaUseCase(vendaRepo).execute({ vendaId: venda.id, valor: 80, formaPag: 'Pix' })
    const remover = new RemoverPagamentoVendaUseCase(vendaRepo)

    const atual = await remover.execute({ vendaId: venda.id, pagamentoId: venda.pagamentos[0].id })
    expect(atual.valorEmAberto).toBe(200)
    await expect(remover.execute({ vendaId: venda.id, pagamentoId: 'nao-existe' })).rejects.toMatchObject({ code: 'NOT_FOUND' })
    await expect(remover.execute({ vendaId: crypto.randomUUID(), pagamentoId: 'x' })).rejects.toMatchObject({ code: 'NOT_FOUND' })
  })

  it('editar a venda mantém valor recebido e recebimentos; em aberto acompanha o total novo', async () => {
    const venda = await createUC.execute({ clienteId, formaPag: 'Pix', itens, valorRecebido: 50 })
    await new RegistrarPagamentoVendaUseCase(vendaRepo).execute({ vendaId: venda.id, valor: 50, formaPag: 'Pix' })

    const editada = await new UpdateVendaUseCase(vendaRepo).execute({
      id: venda.id,
      itens: [{ nome: 'Ração', qtd: 1, valorUnitario: 250 }],
    })
    expect(editada.valorRecebido).toBe(50)
    expect(editada.pagamentos).toHaveLength(1)
    expect(editada.valorEmAberto).toBe(150)
  })

  it('venda paga por inteiro continua quitada ao editar o total', async () => {
    const venda = await createUC.execute({ clienteId, formaPag: 'Pix', itens })
    const editada = await new UpdateVendaUseCase(vendaRepo).execute({
      id: venda.id,
      itens: [{ nome: 'Ração', qtd: 1, valorUnitario: 250 }],
    })
    expect(editada.valorEmAberto).toBe(0)
    expect(editada.valorPago).toBe(250)
  })

  it('venda restaurada com recebimentos (como do banco) recalcula o em aberto', () => {
    const venda = Venda.create({
      id: crypto.randomUUID(),
      clienteId,
      formaPag: 'Pix',
      itens,
      valorRecebido: 20,
      pagamentos: [{ id: 'p1', valor: 30, data: new Date(), formaPag: 'Dinheiro' }],
    })
    expect(venda.valorEmAberto).toBe(150)
  })
})

describe('ConverterOrcamento — valor em aberto', () => {
  it('converter com valorRecebido deixa a diferença em aberto; maior que o total é recusado', async () => {
    const orcamentoRepo = new InMemoryOrcamentoRepository()
    const vendaRepo = new InMemoryVendaRepository()
    const useCase = new ConverterOrcamentoUseCase(orcamentoRepo, vendaRepo)
    const novo = () => Orcamento.create({
      clienteId,
      validade: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      itens: [{ nome: 'Ração', qtd: 1, valorUnitario: 100 }],
    })

    const o = novo()
    await orcamentoRepo.save(o)
    const venda = await useCase.execute({ id: o.id, formaPag: 'Pix', valorRecebido: 30 })
    expect(venda.valorEmAberto).toBe(70)

    const o2 = novo()
    await orcamentoRepo.save(o2)
    await expect(useCase.execute({ id: o2.id, formaPag: 'Pix', valorRecebido: 101 })).rejects.toMatchObject({ code: 'VALIDATION_ERROR' })
    expect((await orcamentoRepo.findById(o2.id))!.status).toBe('aberto')
  })
})
