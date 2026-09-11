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
})
