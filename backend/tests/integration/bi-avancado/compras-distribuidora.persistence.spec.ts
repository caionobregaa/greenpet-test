import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { PrismaBiAvancadoRepository } from '@/modules/bi-avancado/infrastructure/repositories/prisma-bi-avancado.repository'

// specs/bi-avancado/spec-v2.md — compras por distribuidora, mês a mês.
const MESES = ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09']

async function criarCompra(fornecedor: string, dataPedido: string, total: number, opts: { status?: string; categoria?: string } = {}) {
  await prismaTest.compra.create({
    data: {
      fornecedor,
      categoria: opts.categoria ?? 'Produtos Pets',
      status: opts.status ?? 'recebido',
      dataPedido: new Date(dataPedido),
      total,
    },
  })
}

describe('BI — compras por distribuidora mensal', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await prismaTest.$disconnect()
  })

  it('soma por distribuidora e mês, só Produtos Pets, sem canceladas nem compras fora da janela', async () => {
    await criarCompra('Market', '2026-09-01', 200)
    await criarCompra('Market', '2026-09-30', 100)
    await criarCompra('Market', '2026-04-01', 50)
    await criarCompra('Zoo Center', '2026-08-15', 500)
    await criarCompra('Zoo Center', '2026-08-16', 999, { status: 'cancelado' })
    await criarCompra('Aluguel', '2026-09-05', 2000, { categoria: 'Aluguel' })
    await criarCompra('Market', '2026-03-31', 777)
    await criarCompra('Market', '2026-10-01', 888)

    const repo = new PrismaBiAvancadoRepository(prismaTest)
    const r = await repo.getComprasPorDistribuidoraMensal(MESES)

    expect(r.meses).toEqual(MESES)
    expect(r.distribuidoras).toEqual([
      {
        fornecedor: 'Zoo Center',
        total: 500,
        porMes: { '2026-04': 0, '2026-05': 0, '2026-06': 0, '2026-07': 0, '2026-08': 500, '2026-09': 0 },
      },
      {
        fornecedor: 'Market',
        total: 350,
        porMes: { '2026-04': 50, '2026-05': 0, '2026-06': 0, '2026-07': 0, '2026-08': 0, '2026-09': 300 },
      },
    ])
    expect(r.totaisPorMes).toEqual({ '2026-04': 50, '2026-05': 0, '2026-06': 0, '2026-07': 0, '2026-08': 500, '2026-09': 300 })
  })

  it('sem compras retorna os 6 meses zerados e nenhuma distribuidora', async () => {
    const repo = new PrismaBiAvancadoRepository(prismaTest)
    const r = await repo.getComprasPorDistribuidoraMensal(MESES)

    expect(r.distribuidoras).toEqual([])
    expect(Object.values(r.totaisPorMes)).toEqual([0, 0, 0, 0, 0, 0])
  })
})
