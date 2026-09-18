import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { PrismaClienteRepository } from '@/modules/clientes/infrastructure/repositories/prisma-cliente.repository'
import { CreateClienteUseCase } from '@/modules/clientes/application/use-cases/create-cliente.use-case'
import { PrismaVendaRepository } from '@/modules/vendas/infrastructure/repositories/prisma-venda.repository'
import { CreateVendaUseCase } from '@/modules/vendas/application/use-cases/create-venda.use-case'
import { PrismaProdutoRepository } from '@/modules/produtos/infrastructure/repositories/prisma-produto.repository'
import { CreateProdutoUseCase } from '@/modules/produtos/application/use-cases/create-produto.use-case'
import { PrismaBiAvancadoRepository } from '@/modules/bi-avancado/infrastructure/repositories/prisma-bi-avancado.repository'
import { GetBiAvancadoUseCase } from '@/modules/bi-avancado/application/use-cases/get-bi-avancado.use-case'
import { PrismaOrcamentoRepository } from '@/modules/orcamentos/infrastructure/repositories/prisma-orcamento.repository'
import { CreateOrcamentoUseCase } from '@/modules/orcamentos/application/use-cases/create-orcamento.use-case'
import { UpdateOrcamentoStatusUseCase } from '@/modules/orcamentos/application/use-cases/update-orcamento-status.use-case'

const DIA_MS = 24 * 60 * 60 * 1000

describe('BI avançado', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await prismaTest.$disconnect()
  })

  it('calcula LTV, taxa de recompra, ciclo por categoria e margem por categoria', async () => {
    const clienteRepo = new PrismaClienteRepository(prismaTest)
    const createClienteUC = new CreateClienteUseCase(clienteRepo)
    const vendaRepo = new PrismaVendaRepository(prismaTest)
    const createVendaUC = new CreateVendaUseCase(vendaRepo, clienteRepo)
    const produtoRepo = new PrismaProdutoRepository(prismaTest)
    const createProdutoUC = new CreateProdutoUseCase(produtoRepo)

    const racao = await createProdutoUC.execute({ nome: 'Ração X', categoria: 'Ração', valorCusto: 60, valorVenda: 100 })

    const clienteFiel = await createClienteUC.execute({ nome: 'Cliente Fiel', telefone: '92911111111' })
    const clienteUnico = await createClienteUC.execute({ nome: 'Cliente Único', telefone: '92922222222' })

    // Cliente fiel: 3 compras de Ração espaçadas ~30 dias -> ciclo médio ~30 dias, 2 amostras
    const datas = [new Date(Date.now() - 60 * DIA_MS), new Date(Date.now() - 30 * DIA_MS), new Date()]
    for (const data of datas) {
      await createVendaUC.execute({
        clienteId: clienteFiel.id,
        data,
        formaPag: 'Pix',
        itens: [{ nome: 'Ração X', qtd: 1, valorUnitario: 100, produtoId: racao.id }],
      })
    }

    // Cliente único: 1 compra só
    await createVendaUC.execute({
      clienteId: clienteUnico.id,
      formaPag: 'Pix',
      itens: [{ nome: 'Ração X', qtd: 1, valorUnitario: 100, produtoId: racao.id }],
    })

    const repo = new PrismaBiAvancadoRepository(prismaTest)
    const useCase = new GetBiAvancadoUseCase(repo)

    const hoje = new Date()
    const inicio = new Date(Date.now() - 90 * DIA_MS)
    const resultado = await useCase.execute({ inicio, fim: hoje })

    // Ranking LTV: cliente fiel gastou 300 em 3 vendas, cliente único 100 em 1
    expect(resultado.rankingLtv.total).toBe(2)
    expect(resultado.rankingLtv.clientes[0]).toMatchObject({ nome: 'Cliente Fiel', totalGasto: 300, totalVendas: 3 })
    expect(resultado.rankingLtv.clientes[1]).toMatchObject({ nome: 'Cliente Único', totalGasto: 100, totalVendas: 1 })

    // Taxa de recompra: 1 de 2 clientes comprou mais de uma vez = 50%
    expect(resultado.taxaRecompra).toEqual({ percentual: 50, clientesComRecompra: 1, totalClientes: 2 })

    // Ciclo de recompra por categoria: Ração teve 2 intervalos de ~30 dias (pool de 1 cliente)
    const racaoCiclo = resultado.cicloRecompraPorCategoria.find((c) => c.categoria === 'Ração')
    expect(racaoCiclo?.amostras).toBe(2)
    expect(racaoCiclo?.cicloMedioDias).toBeCloseTo(30, 0)

    // Margem por categoria: catálogo (60->100 = 40%) e realizada (4 vendas de 100, custo 60 = 40%)
    const racaoMargem = resultado.margemPorCategoria.find((m) => m.categoria === 'Ração')
    expect(racaoMargem?.margemMediaCatalogo).toBeCloseTo(40, 1)
    expect(racaoMargem?.margemRealizada).toBeCloseTo(40, 1)
  })

  it('retorna listas vazias / null quando não há vendas', async () => {
    const repo = new PrismaBiAvancadoRepository(prismaTest)
    const useCase = new GetBiAvancadoUseCase(repo)
    const hoje = new Date()

    const resultado = await useCase.execute({ inicio: new Date(Date.now() - 30 * DIA_MS), fim: hoje })

    expect(resultado.rankingLtv).toEqual({ clientes: [], total: 0 })
    expect(resultado.taxaRecompra).toEqual({ percentual: 0, clientesComRecompra: 0, totalClientes: 0 })
    expect(resultado.cicloRecompraPorCategoria).toEqual([])
  })

  it('calcula a taxa de recompra em janelas de 30/60/90 dias', async () => {
    const clienteRepo = new PrismaClienteRepository(prismaTest)
    const createClienteUC = new CreateClienteUseCase(clienteRepo)
    const vendaRepo = new PrismaVendaRepository(prismaTest)
    const createVendaUC = new CreateVendaUseCase(vendaRepo, clienteRepo)

    const clienteA = await createClienteUC.execute({ nome: 'Recompra Rápida', telefone: '92933333331' })
    const clienteB = await createClienteUC.execute({ nome: 'Recompra Lenta', telefone: '92933333332' })
    const clienteC = await createClienteUC.execute({ nome: 'Sem Recompra', telefone: '92933333333' })

    const item = [{ nome: 'Ração', qtd: 1, valorUnitario: 100 }]

    // Cliente A: 1ª compra dia -50, 2ª compra dia -30 (gap de 20 dias) -> conta em 30/60/90
    await createVendaUC.execute({ clienteId: clienteA.id, data: new Date(Date.now() - 50 * DIA_MS), formaPag: 'Pix', itens: item })
    await createVendaUC.execute({ clienteId: clienteA.id, data: new Date(Date.now() - 30 * DIA_MS), formaPag: 'Pix', itens: item })

    // Cliente B: 1ª compra dia -50, 2ª compra dia -5 (gap de 45 dias) -> conta só em 60/90
    await createVendaUC.execute({ clienteId: clienteB.id, data: new Date(Date.now() - 50 * DIA_MS), formaPag: 'Pix', itens: item })
    await createVendaUC.execute({ clienteId: clienteB.id, data: new Date(Date.now() - 5 * DIA_MS), formaPag: 'Pix', itens: item })

    // Cliente C: só 1 compra -> não conta em nenhuma janela
    await createVendaUC.execute({ clienteId: clienteC.id, data: new Date(Date.now() - 50 * DIA_MS), formaPag: 'Pix', itens: item })

    const repo = new PrismaBiAvancadoRepository(prismaTest)
    const useCase = new GetBiAvancadoUseCase(repo)
    const resultado = await useCase.execute({ inicio: new Date(Date.now() - 90 * DIA_MS), fim: new Date() })

    const janela30 = resultado.taxaRecompraJanela.find((j) => j.janelaDias === 30)
    const janela60 = resultado.taxaRecompraJanela.find((j) => j.janelaDias === 60)
    const janela90 = resultado.taxaRecompraJanela.find((j) => j.janelaDias === 90)

    expect(janela30).toMatchObject({ totalClientes: 3, clientesComRecompra: 1 })
    expect(janela60).toMatchObject({ totalClientes: 3, clientesComRecompra: 2 })
    expect(janela90).toMatchObject({ totalClientes: 3, clientesComRecompra: 2 })
  })

  it('calcula a taxa de recompra mensal por cohort de 1ª compra', async () => {
    const clienteRepo = new PrismaClienteRepository(prismaTest)
    const createClienteUC = new CreateClienteUseCase(clienteRepo)
    const vendaRepo = new PrismaVendaRepository(prismaTest)
    const createVendaUC = new CreateVendaUseCase(vendaRepo, clienteRepo)

    const clienteRecompra = await createClienteUC.execute({ nome: 'Cohort Recompra', telefone: '92944444441' })
    const clienteSemRecompra = await createClienteUC.execute({ nome: 'Cohort Sem Recompra', telefone: '92944444442' })

    const item = [{ nome: 'Ração', qtd: 1, valorUnitario: 100 }]

    await createVendaUC.execute({ clienteId: clienteRecompra.id, data: new Date(Date.now() - 70 * DIA_MS), formaPag: 'Pix', itens: item })
    await createVendaUC.execute({ clienteId: clienteRecompra.id, data: new Date(Date.now() - 10 * DIA_MS), formaPag: 'Pix', itens: item })

    await createVendaUC.execute({ clienteId: clienteSemRecompra.id, data: new Date(Date.now() - 40 * DIA_MS), formaPag: 'Pix', itens: item })

    const repo = new PrismaBiAvancadoRepository(prismaTest)
    const useCase = new GetBiAvancadoUseCase(repo)
    const resultado = await useCase.execute({ inicio: new Date(Date.now() - 90 * DIA_MS), fim: new Date() })

    const totalClientes = resultado.taxaRecompraMensal.reduce((s, m) => s + m.totalClientes, 0)
    const totalComRecompra = resultado.taxaRecompraMensal.reduce((s, m) => s + m.clientesComRecompra, 0)

    expect(totalClientes).toBe(2)
    expect(totalComRecompra).toBe(1)
  })

  it('calcula taxa de fechamento/não-fechamento de orçamentos e o breakdown de motivo de perda', async () => {
    const clienteRepo = new PrismaClienteRepository(prismaTest)
    const createClienteUC = new CreateClienteUseCase(clienteRepo)
    const cliente = await createClienteUC.execute({ nome: 'Cliente Orçamentos', telefone: '92955555555' })

    const orcamentoRepo = new PrismaOrcamentoRepository(prismaTest)
    const createOrcamentoUC = new CreateOrcamentoUseCase(orcamentoRepo, clienteRepo)
    const statusUC = new UpdateOrcamentoStatusUseCase(orcamentoRepo)

    const itens = [{ nome: 'Ração', qtd: 1, valorUnitario: 100 }]
    const novoOrcamento = () => createOrcamentoUC.execute({ clienteId: cliente.id, validade: new Date(Date.now() + 7 * DIA_MS), itens })

    // 3 fechados
    for (let i = 0; i < 3; i++) {
      const o = await novoOrcamento()
      await statusUC.execute({ id: o.id, acao: 'fechar' })
    }
    // 2 perdidos (motivos diferentes)
    const perdido1 = await novoOrcamento()
    await statusUC.execute({ id: perdido1.id, acao: 'perder', motivo: 'Preço' })
    const perdido2 = await novoOrcamento()
    await statusUC.execute({ id: perdido2.id, acao: 'perder', motivo: 'Cliente desistiu' })
    // 1 aberto (fora do denominador)
    await novoOrcamento()

    const repo = new PrismaBiAvancadoRepository(prismaTest)
    const useCase = new GetBiAvancadoUseCase(repo)
    const resultado = await useCase.execute({ inicio: new Date(Date.now() - DIA_MS), fim: new Date(Date.now() + DIA_MS) })

    expect(resultado.taxaFechamento.total).toEqual({ fechados: 3, perdidos: 2, taxaFechamento: 60, taxaNaoFechamento: 40 })
    expect(resultado.taxaFechamento.breakdownMotivoPerda).toEqual(
      expect.arrayContaining([
        { motivo: 'Preço', quantidade: 1, percentual: 50 },
        { motivo: 'Cliente desistiu', quantidade: 1, percentual: 50 },
      ]),
    )
  })
})
