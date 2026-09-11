import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { PrismaClienteRepository } from '@/modules/clientes/infrastructure/repositories/prisma-cliente.repository'
import { CreateClienteUseCase } from '@/modules/clientes/application/use-cases/create-cliente.use-case'
import { PrismaVendaRepository } from '@/modules/vendas/infrastructure/repositories/prisma-venda.repository'
import { CreateVendaUseCase } from '@/modules/vendas/application/use-cases/create-venda.use-case'
import { PrismaProdutoRepository } from '@/modules/produtos/infrastructure/repositories/prisma-produto.repository'
import { CreateProdutoUseCase } from '@/modules/produtos/application/use-cases/create-produto.use-case'
import { PrismaRecompraRepository } from '@/modules/recompra/infrastructure/repositories/prisma-recompra.repository'
import { PrismaDashboardRepository } from '@/modules/dashboard/infrastructure/repositories/prisma-dashboard.repository'
import { GetDashboardOverviewUseCase } from '@/modules/dashboard/application/use-cases/get-dashboard-overview.use-case'
import { PrismaCurvaVendaRepository } from '@/modules/curva-venda/infrastructure/repositories/prisma-curva-venda.repository'
import { GetCurvaVendaUseCase } from '@/modules/curva-venda/application/use-cases/get-curva-venda.use-case'
import { PrismaDashboardOperacionalRepository } from '@/modules/dashboard-operacional/infrastructure/repositories/prisma-dashboard-operacional.repository'
import { GetDashboardOperacionalUseCase } from '@/modules/dashboard-operacional/application/use-cases/get-dashboard-operacional.use-case'

const DIA_MS = 24 * 60 * 60 * 1000

describe('Dashboard operacional', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await prismaTest.$disconnect()
  })

  it('agrega recompra da semana/atrasada/sumidos, margem negativa e estoque baixo', async () => {
    const clienteRepo = new PrismaClienteRepository(prismaTest)
    const createClienteUC = new CreateClienteUseCase(clienteRepo)
    const vendaRepo = new PrismaVendaRepository(prismaTest)
    const createVendaUC = new CreateVendaUseCase(vendaRepo, clienteRepo)
    const produtoRepo = new PrismaProdutoRepository(prismaTest)
    const createProdutoUC = new CreateProdutoUseCase(produtoRepo)

    // Produtos: um caro (pra gerar venda com margem negativa) e dois com
    // estoqueMinimo configurado (um abaixo, um acima do mínimo) + um sem
    // estoqueMinimo (não deve entrar no relatório mesmo com pouco estoque).
    const produtoCaro = await createProdutoUC.execute({ nome: 'Remédio Caro', categoria: 'Medicamento', valorCusto: 100, valorVenda: 150 })
    const produtoEstoqueBaixo = await createProdutoUC.execute({ nome: 'Ração Estoque Baixo', categoria: 'Ração', valorVenda: 50, estoqueMinimo: 10 })
    const produtoEstoqueOk = await createProdutoUC.execute({ nome: 'Ração Estoque OK', categoria: 'Ração', valorVenda: 50, estoqueMinimo: 5 })
    const produtoSemMinimo = await createProdutoUC.execute({ nome: 'Produto Sem Minimo', categoria: 'Petisco', valorVenda: 20 })

    await prismaTest.estoqueItem.create({ data: { produtoId: produtoEstoqueBaixo.id, quantidade: 3 } })
    await prismaTest.estoqueItem.create({ data: { produtoId: produtoEstoqueOk.id, quantidade: 8 } })
    await prismaTest.estoqueItem.create({ data: { produtoId: produtoSemMinimo.id, quantidade: 0 } })

    const clienteSemana = await createClienteUC.execute({ nome: 'Cliente Semana', telefone: '92900000001' })
    const clienteAtrasadoLeve = await createClienteUC.execute({ nome: 'Cliente Atrasado Leve', telefone: '92900000002' })
    const clienteSumido = await createClienteUC.execute({ nome: 'Cliente Sumido', telefone: '92900000003' })

    // Venda com margem negativa: custo 100, vendido por 50 -> margem -50
    await createVendaUC.execute({
      clienteId: clienteSemana.id,
      formaPag: 'Pix',
      itens: [{ nome: 'Remédio Caro', qtd: 1, valorUnitario: 50, produtoId: produtoCaro.id }],
    })

    // Recompra "da semana" (daqui a 5 dias -> proximo)
    await createVendaUC.execute({
      clienteId: clienteSemana.id,
      formaPag: 'Pix',
      itens: [{
        nome: 'Ração Estoque OK', qtd: 1, valorUnitario: 50, produtoId: produtoEstoqueOk.id,
        recompraData: new Date(Date.now() + 5 * DIA_MS),
      }],
    })

    // Recompra atrasada, mas só 5 dias (não é "sumido")
    await createVendaUC.execute({
      clienteId: clienteAtrasadoLeve.id,
      formaPag: 'Pix',
      itens: [{
        nome: 'Ração Estoque OK', qtd: 1, valorUnitario: 50, produtoId: produtoEstoqueOk.id,
        recompraData: new Date(Date.now() - 5 * DIA_MS),
      }],
    })

    // Recompra atrasada há 40 dias -> "sumido"
    await createVendaUC.execute({
      clienteId: clienteSumido.id,
      formaPag: 'Pix',
      itens: [{
        nome: 'Ração Estoque OK', qtd: 1, valorUnitario: 50, produtoId: produtoEstoqueOk.id,
        recompraData: new Date(Date.now() - 40 * DIA_MS),
      }],
    })

    const recompraRepo = new PrismaRecompraRepository(prismaTest)
    const dashboardOverviewUseCase = new GetDashboardOverviewUseCase(
      new PrismaDashboardRepository(prismaTest),
      new GetCurvaVendaUseCase(new PrismaCurvaVendaRepository(prismaTest)),
    )
    const operacionalRepo = new PrismaDashboardOperacionalRepository(prismaTest)
    const useCase = new GetDashboardOperacionalUseCase(recompraRepo, dashboardOverviewUseCase, operacionalRepo)

    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const resultado = await useCase.execute({ inicio: inicioMes, fim: hoje })

    // Recompra da semana: 1 item (proximo)
    expect(resultado.recompraSemana.total).toBe(1)
    expect(resultado.recompraSemana.itens[0].clienteNome).toBe('Cliente Semana')

    // Recompra atrasada: 2 (a leve + a sumida)
    expect(resultado.recompraAtrasada.total).toBe(2)

    // Sumidos: só a de 40 dias
    expect(resultado.clientesSumidos.total).toBe(1)
    expect(resultado.clientesSumidos.itens[0].nome).toBe('Cliente Sumido')
    expect(resultado.clientesSumidos.itens[0].diasAtraso).toBeGreaterThan(30)

    // Faturamento: as 4 vendas criadas acima são todas de hoje (50 cada = 200)
    expect(resultado.faturamento.hoje).toBe(200)

    // Margem negativa: só a venda do produto caro
    expect(resultado.vendasMargemNegativa).toHaveLength(1)
    expect(resultado.vendasMargemNegativa[0].margem).toBeLessThan(0)

    // Estoque baixo: só o produto com estoqueMinimo configurado E abaixo dele
    const nomesEstoqueBaixo = resultado.estoqueBaixo.map((p) => p.nome)
    expect(nomesEstoqueBaixo).toContain('Ração Estoque Baixo')
    expect(nomesEstoqueBaixo).not.toContain('Ração Estoque OK')
    expect(nomesEstoqueBaixo).not.toContain('Produto Sem Minimo')
  })
})
