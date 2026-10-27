import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import Fastify from 'fastify'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { registerOrcamentosRoutes } from '@/modules/orcamentos/infrastructure/http/orcamentos.routes'
import { errorHandler } from '@/shared/infrastructure/http/error-handler'

// specs/orcamentos/spec-v5.md — brinde no orçamento (round-trip)

async function buildApp() {
  const app = Fastify()
  app.setErrorHandler(errorHandler)
  registerOrcamentosRoutes(app, prismaTest)
  await app.ready()
  return app
}

describe('Orçamento — brinde (round-trip)', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await prismaTest.$disconnect()
  })

  it('grava o brinde zerado, lê de volta e converte em venda com o brinde', async () => {
    const app = await buildApp()
    const cliente = await prismaTest.cliente.create({ data: { nome: 'Ana', telefone: '92911111111' } })

    const criado = await app.inject({
      method: 'POST', url: '/api/v1/orcamentos',
      payload: {
        clienteId: cliente.id, validade: '2026-12-31',
        itens: [
          { nome: 'Ração', qtd: 1, valorUnitario: 100 },
          { nome: 'Petisco', qtd: 2, valorUnitario: 15, brinde: true },
        ],
      },
    })
    expect(criado.statusCode).toBe(201)
    const id = criado.json().data.id
    expect(criado.json().data.total).toBe(100)

    const lido = await app.inject({ method: 'GET', url: `/api/v1/orcamentos/${id}` })
    expect(lido.json().data.itens[1]).toMatchObject({ nome: 'Petisco', brinde: true, valorUnitario: 0, total: 0 })

    const venda = await app.inject({ method: 'POST', url: `/api/v1/orcamentos/${id}/converter`, payload: { formaPag: 'Pix' } })
    expect(venda.statusCode).toBe(201)
    const itens = await prismaTest.vendaItem.findMany({ where: { vendaId: venda.json().data.vendaId }, orderBy: { nome: 'asc' } })
    expect(itens.find((i) => i.nome === 'Petisco')).toMatchObject({ brinde: true })
    await app.close()
  })
})
