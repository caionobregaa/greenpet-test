import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import Fastify from 'fastify'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { registerComprasRoutes } from '@/modules/compras/infrastructure/http/compras.routes'
import { errorHandler } from '@/shared/infrastructure/http/error-handler'

// specs/compras/spec-v2.md — filtro por mês e total somado da listagem de despesas.
async function criarCompra(dataPedido: string, total: number, status = 'pendente', categoria = 'Aluguel') {
  await prismaTest.compra.create({
    data: { fornecedor: categoria, categoria, dataPedido: new Date(dataPedido), total, status },
  })
}

async function buildApp() {
  const app = Fastify()
  app.setErrorHandler(errorHandler)
  registerComprasRoutes(app, prismaTest)
  await app.ready()
  return app
}

describe('GET /api/v1/compras?mes', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await prismaTest.$disconnect()
  })

  it('retorna só as despesas do mês, incluindo o primeiro e o último dia', async () => {
    await criarCompra('2026-08-31', 10)
    await criarCompra('2026-09-01', 20)
    await criarCompra('2026-09-30', 30)
    await criarCompra('2026-10-01', 40)
    const app = await buildApp()

    const res = await app.inject({ method: 'GET', url: '/api/v1/compras?mes=2026-09' })

    expect(res.statusCode).toBe(200)
    const body = res.json()
    expect(body.data.map((c: { total: number }) => c.total).sort()).toEqual([20, 30])
    expect(body.meta.total).toBe(2)
    expect(body.meta.totalValor).toBe(50)
  })

  it('totalValor ignora despesas canceladas', async () => {
    await criarCompra('2026-09-10', 100)
    await criarCompra('2026-09-11', 999, 'cancelado')
    const app = await buildApp()

    const body = (await app.inject({ method: 'GET', url: '/api/v1/compras?mes=2026-09' })).json()

    expect(body.meta.total).toBe(2)
    expect(body.meta.totalValor).toBe(100)
  })

  it('totalValor é o mesmo em qualquer página', async () => {
    for (let dia = 1; dia <= 5; dia++) await criarCompra(`2026-09-0${dia}`, 10)
    const app = await buildApp()

    const p1 = (await app.inject({ method: 'GET', url: '/api/v1/compras?mes=2026-09&limit=2&page=1' })).json()
    const p3 = (await app.inject({ method: 'GET', url: '/api/v1/compras?mes=2026-09&limit=2&page=3' })).json()

    expect(p1.data).toHaveLength(2)
    expect(p3.data).toHaveLength(1)
    expect(p1.meta.totalValor).toBe(50)
    expect(p3.meta.totalValor).toBe(50)
  })

  it('sem mes retorna despesas de todas as datas', async () => {
    await criarCompra('2025-01-10', 10)
    await criarCompra('2026-09-10', 20)
    const app = await buildApp()

    const body = (await app.inject({ method: 'GET', url: '/api/v1/compras' })).json()

    expect(body.meta.total).toBe(2)
    expect(body.meta.totalValor).toBe(30)
  })

  it('despesa sem itens é listada e detalhada com o total gravado', async () => {
    await criarCompra('2026-09-05', 1500)
    const app = await buildApp()

    const lista = (await app.inject({ method: 'GET', url: '/api/v1/compras?mes=2026-09' })).json()
    const detalhe = (await app.inject({ method: 'GET', url: `/api/v1/compras/${lista.data[0].id}` })).json()

    expect(lista.data[0].total).toBe(1500)
    expect(detalhe.data.total).toBe(1500)
  })

  it.each(['2026-13', '09-2026', '2026-9'])('mes inválido (%s) retorna 400 VALIDATION_ERROR', async (mes) => {
    const app = await buildApp()

    const res = await app.inject({ method: 'GET', url: `/api/v1/compras?mes=${mes}` })

    expect(res.statusCode).toBe(400)
    expect(res.json().error.code).toBe('VALIDATION_ERROR')
  })
})
