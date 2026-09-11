import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { PrismaClienteRepository } from '@/modules/clientes/infrastructure/repositories/prisma-cliente.repository'
import { CreateClienteUseCase } from '@/modules/clientes/application/use-cases/create-cliente.use-case'
import { PrismaVendaRepository } from '@/modules/vendas/infrastructure/repositories/prisma-venda.repository'
import { CreateVendaUseCase } from '@/modules/vendas/application/use-cases/create-venda.use-case'
import { PrismaCompraRepository } from '@/modules/compras/infrastructure/repositories/prisma-compra.repository'
import { CreateCompraUseCase } from '@/modules/compras/application/use-cases/create-compra.use-case'
import { PrismaDashboardRepository } from '@/modules/dashboard/infrastructure/repositories/prisma-dashboard.repository'
import { GetDashboardOverviewUseCase } from '@/modules/dashboard/application/use-cases/get-dashboard-overview.use-case'
import { PrismaCurvaVendaRepository } from '@/modules/curva-venda/infrastructure/repositories/prisma-curva-venda.repository'
import { GetCurvaVendaUseCase } from '@/modules/curva-venda/application/use-cases/get-curva-venda.use-case'

// Cobertura da expansão do dashboard/BI: taxa de cartão, lucro líquido real,
// vendas por forma de pagamento, despesas por categoria e comparação com o
// período anterior — tudo validado contra Postgres real, não mocks.
describe('Dashboard — overview de BI', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await prismaTest.$disconnect()
  })

  it('agrega forma de pagamento, categoria de despesa, taxa de cartão e comparação de período', async () => {
    const clienteRepo = new PrismaClienteRepository(prismaTest)
    const createClienteUC = new CreateClienteUseCase(clienteRepo)
    const vendaRepo = new PrismaVendaRepository(prismaTest)
    const createVendaUC = new CreateVendaUseCase(vendaRepo, clienteRepo)
    const compraRepo = new PrismaCompraRepository(prismaTest)
    const createCompraUC = new CreateCompraUseCase(compraRepo)

    const cliente = await createClienteUC.execute({ nome: 'Cliente BI', telefone: '92999990000' })

    // Período atual: 2024-01-10
    const dataAtual = new Date('2024-01-10T12:00:00.000Z')
    await createVendaUC.execute({
      clienteId: cliente.id,
      data: dataAtual,
      formaPag: 'Pix',
      itens: [{ nome: 'Item Pix', qtd: 1, valorUnitario: 100 }],
    })
    await createVendaUC.execute({
      clienteId: cliente.id,
      data: dataAtual,
      formaPag: 'Cartão Crédito',
      taxaCartao: 3.15,
      itens: [{ nome: 'Item Cartão', qtd: 1, valorUnitario: 200 }],
    })
    await createCompraUC.execute({
      fornecedor: 'Fornecedor A',
      dataPedido: dataAtual,
      categoria: 'Produtos Pets',
      itens: [{ nome: 'Compra Produtos', qtd: 1, valorUnitario: 50 }],
    })
    await createCompraUC.execute({
      fornecedor: 'Fornecedor B',
      dataPedido: dataAtual,
      categoria: 'Marketing',
      itens: [{ nome: 'Compra Marketing', qtd: 1, valorUnitario: 30 }],
    })

    // Período anterior (o dia 2024-01-09, imediatamente antes)
    const dataAnterior = new Date('2024-01-09T12:00:00.000Z')
    await createVendaUC.execute({
      clienteId: cliente.id,
      data: dataAnterior,
      formaPag: 'Dinheiro',
      itens: [{ nome: 'Item dia anterior', qtd: 1, valorUnitario: 50 }],
    })

    const dashboardRepo = new PrismaDashboardRepository(prismaTest)
    const curvaVendaUC = new GetCurvaVendaUseCase(new PrismaCurvaVendaRepository(prismaTest))
    const useCase = new GetDashboardOverviewUseCase(dashboardRepo, curvaVendaUC)

    const inicio = new Date('2024-01-10T00:00:00.000Z')
    const fim = new Date('2024-01-10T23:59:59.999Z')
    const overview = await useCase.execute({ inicio, fim })

    // Campos que já existiam continuam corretos
    expect(overview.totalReceita).toBe(300) // 100 + 200
    expect(overview.totalVendas).toBe(2)
    expect(overview.ticketMedio).toBe(150)

    // Novo: taxa de cartão e lucro líquido real
    // 200 * 3.15% = 6.30 de taxa; sem produtoId nos itens, custo = 0, então lucro bruto = receita
    expect(overview.totalTaxasCartao).toBeCloseTo(6.3, 2)
    expect(overview.totalLucroLiquido).toBe(300)
    expect(overview.totalLucroLiquidoReal).toBeCloseTo(300 - 6.3, 2)

    // Novo: vendas por forma de pagamento
    const porForma = new Map(overview.vendasPorFormaPagamento.map((f) => [f.formaPag, f]))
    expect(porForma.get('Pix')).toMatchObject({ total: 100, vendas: 1 })
    expect(porForma.get('Cartão Crédito')).toMatchObject({ total: 200, vendas: 1 })
    expect(porForma.has('Dinheiro')).toBe(false) // venda do dia anterior não entra no período atual

    // Novo: despesas por categoria
    const porCategoria = new Map(overview.despesasPorCategoria.map((c) => [c.categoria, c]))
    expect(porCategoria.get('Produtos Pets')).toMatchObject({ total: 50, compras: 1 })
    expect(porCategoria.get('Marketing')).toMatchObject({ total: 30, compras: 1 })

    // Novo: comparação com o período anterior (2024-01-09, que teve 1 venda de 50)
    expect(overview.comparativoPeriodoAnterior.totalReceita.anterior).toBe(50)
    expect(overview.comparativoPeriodoAnterior.totalReceita.atual).toBe(300)
    expect(overview.comparativoPeriodoAnterior.totalReceita.variacaoPercentual).toBeCloseTo(500, 1) // de 50 para 300 = +500%
    expect(overview.comparativoPeriodoAnterior.totalVendas).toMatchObject({ atual: 2, anterior: 1, variacaoPercentual: 100 })

    // Novo: resumo da curva ABC vem no formato esperado (sem produtos cadastrados nos itens, fica zerado)
    expect(overview.curvaResumo).toEqual({ A: 0, B: 0, C: 0 })
  })

  it('retorna variacaoPercentual null quando não há dado no período anterior', async () => {
    const clienteRepo = new PrismaClienteRepository(prismaTest)
    const createClienteUC = new CreateClienteUseCase(clienteRepo)
    const vendaRepo = new PrismaVendaRepository(prismaTest)
    const createVendaUC = new CreateVendaUseCase(vendaRepo, clienteRepo)

    const cliente = await createClienteUC.execute({ nome: 'Cliente Sem Historico', telefone: '92988880000' })
    await createVendaUC.execute({
      clienteId: cliente.id,
      data: new Date('2024-02-15T12:00:00.000Z'),
      formaPag: 'Pix',
      itens: [{ nome: 'Item único', qtd: 1, valorUnitario: 80 }],
    })

    const dashboardRepo = new PrismaDashboardRepository(prismaTest)
    const curvaVendaUC = new GetCurvaVendaUseCase(new PrismaCurvaVendaRepository(prismaTest))
    const useCase = new GetDashboardOverviewUseCase(dashboardRepo, curvaVendaUC)

    const overview = await useCase.execute({
      inicio: new Date('2024-02-15T00:00:00.000Z'),
      fim: new Date('2024-02-15T23:59:59.999Z'),
    })

    expect(overview.comparativoPeriodoAnterior.totalReceita.anterior).toBe(0)
    expect(overview.comparativoPeriodoAnterior.totalReceita.variacaoPercentual).toBeNull()
  })
})
