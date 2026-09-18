import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { PrismaClienteRepository } from '@/modules/clientes/infrastructure/repositories/prisma-cliente.repository'
import { CreateClienteUseCase } from '@/modules/clientes/application/use-cases/create-cliente.use-case'
import { PrismaOrcamentoRepository } from '@/modules/orcamentos/infrastructure/repositories/prisma-orcamento.repository'
import { CreateOrcamentoUseCase } from '@/modules/orcamentos/application/use-cases/create-orcamento.use-case'
import { UpdateOrcamentoStatusUseCase } from '@/modules/orcamentos/application/use-cases/update-orcamento-status.use-case'
import { UpdateOrcamentoUseCase } from '@/modules/orcamentos/application/use-cases/update-orcamento.use-case'

const DIA_MS = 24 * 60 * 60 * 1000

describe('Orçamento — status, motivo de perda e desconto de recompra (round-trip)', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await prismaTest.$disconnect()
  })

  it('persiste motivoPerda ao marcar como perdido e limpa ao reabrir', async () => {
    const clienteRepo = new PrismaClienteRepository(prismaTest)
    const createClienteUC = new CreateClienteUseCase(clienteRepo)
    const cliente = await createClienteUC.execute({ nome: 'Cliente Teste', telefone: '92966666666' })

    const orcamentoRepo = new PrismaOrcamentoRepository(prismaTest)
    const createOrcamentoUC = new CreateOrcamentoUseCase(orcamentoRepo, clienteRepo)
    const statusUC = new UpdateOrcamentoStatusUseCase(orcamentoRepo)

    const o = await createOrcamentoUC.execute({
      clienteId: cliente.id,
      validade: new Date(Date.now() + 7 * DIA_MS),
      itens: [{ nome: 'Ração', qtd: 1, valorUnitario: 100 }],
    })

    await statusUC.execute({ id: o.id, acao: 'perder', motivo: 'Sem estoque' })
    const perdido = await orcamentoRepo.findById(o.id)
    expect(perdido!.status).toBe('perdido')
    expect(perdido!.motivoPerda).toBe('Sem estoque')

    await statusUC.execute({ id: o.id, acao: 'reabrir' })
    const reaberto = await orcamentoRepo.findById(o.id)
    expect(reaberto!.status).toBe('aberto')
    expect(reaberto!.motivoPerda).toBeUndefined()
  })

  it('persiste descontoRecompraAplicado e valorDescontoRecompra via update', async () => {
    const clienteRepo = new PrismaClienteRepository(prismaTest)
    const createClienteUC = new CreateClienteUseCase(clienteRepo)
    const cliente = await createClienteUC.execute({ nome: 'Cliente Recompra', telefone: '92977777777' })

    const orcamentoRepo = new PrismaOrcamentoRepository(prismaTest)
    const createOrcamentoUC = new CreateOrcamentoUseCase(orcamentoRepo, clienteRepo)
    const updateUC = new UpdateOrcamentoUseCase(orcamentoRepo)

    const o = await createOrcamentoUC.execute({
      clienteId: cliente.id,
      validade: new Date(Date.now() + 7 * DIA_MS),
      itens: [{ nome: 'Ração', qtd: 1, valorUnitario: 100 }],
    })
    expect(o.descontoRecompraAplicado).toBe(false)

    await updateUC.execute({ id: o.id, descontoRecompraAplicado: true, valorDescontoRecompra: 15 })

    const atualizado = await orcamentoRepo.findById(o.id)
    expect(atualizado!.descontoRecompraAplicado).toBe(true)
    expect(atualizado!.valorDescontoRecompra).toBe(15)
  })
})
