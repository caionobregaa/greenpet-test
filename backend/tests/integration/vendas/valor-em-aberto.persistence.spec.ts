import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import Fastify from 'fastify'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { registerVendasRoutes } from '@/modules/vendas/infrastructure/http/vendas.routes'
import { errorHandler } from '@/shared/infrastructure/http/error-handler'

// specs/vendas/spec-v6.md — valor em aberto: gravação, recebimentos e GET /vendas/em-aberto.

async function buildApp() {
  const app = Fastify()
  app.setErrorHandler(errorHandler)
  registerVendasRoutes(app, prismaTest)
  await app.ready()
  return app
}

async function criarCliente(nome: string, telefone: string) {
  return prismaTest.cliente.create({ data: { nome, telefone } })
}

describe('Vendas — valor em aberto (round-trip)', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await prismaTest.$disconnect()
  })

  it('grava o valor recebido, registra e exclui recebimentos e lista o que está em aberto', async () => {
    const app = await buildApp()
    const ana = await criarCliente('Ana', '92911111111')
    const bia = await criarCliente('Bia', '92922222222')
    const itens = [{ nome: 'Ração', qtd: 1, valorUnitario: 200 }]

    const parcial = await app.inject({
      method: 'POST', url: '/api/v1/vendas',
      payload: { clienteId: ana.id, formaPag: 'Pix', data: '2026-10-01', itens, valorRecebido: 50 },
    })
    expect(parcial.statusCode).toBe(201)
    const vendaId = parcial.json().data.id
    expect(parcial.json().data).toMatchObject({ valorRecebido: 50, valorPago: 50, valorEmAberto: 150 })

    // Venda paga por inteiro não aparece em aberto
    const quitada = await app.inject({
      method: 'POST', url: '/api/v1/vendas',
      payload: { clienteId: bia.id, formaPag: 'Pix', itens },
    })
    expect(quitada.json().data.valorEmAberto).toBe(0)
    expect((await prismaTest.venda.findUnique({ where: { id: quitada.json().data.id } }))!.valorRecebido).toBeNull()

    const pago = await app.inject({
      method: 'POST', url: `/api/v1/vendas/${vendaId}/pagamentos`,
      payload: { valor: 100, formaPag: 'Dinheiro', data: '2026-10-10', obs: 'parte 1' },
    })
    expect(pago.statusCode).toBe(201)
    expect(pago.json().data).toMatchObject({ valorPago: 150, valorEmAberto: 50 })
    expect(pago.json().data.pagamentos).toHaveLength(1)

    const lido = await app.inject({ method: 'GET', url: `/api/v1/vendas/${vendaId}` })
    expect(lido.json().data).toMatchObject({ valorEmAberto: 50, cliente: { nome: 'Ana' } })
    expect(lido.json().data.pagamentos[0]).toMatchObject({ valor: 100, formaPag: 'Dinheiro', obs: 'parte 1' })

    const emAberto = await app.inject({ method: 'GET', url: '/api/v1/vendas/em-aberto' })
    expect(emAberto.statusCode).toBe(200)
    expect(emAberto.json().data).toHaveLength(1)
    expect(emAberto.json().data[0]).toMatchObject({
      vendaId, clienteNome: 'Ana', clienteTelefone: '92911111111', total: 200, valorPago: 150, valorEmAberto: 50,
    })
    expect(emAberto.json().meta.totalEmAberto).toBe(50)

    const demais = await app.inject({
      method: 'POST', url: `/api/v1/vendas/${vendaId}/pagamentos`,
      payload: { valor: 60, formaPag: 'Pix' },
    })
    expect(demais.statusCode).toBe(400)

    const pagamentoId = pago.json().data.pagamentos[0].id
    const removido = await app.inject({ method: 'DELETE', url: `/api/v1/vendas/${vendaId}/pagamentos/${pagamentoId}` })
    expect(removido.statusCode).toBe(200)
    expect(removido.json().data.valorEmAberto).toBe(150)

    await app.inject({ method: 'POST', url: `/api/v1/vendas/${vendaId}/pagamentos`, payload: { valor: 150, formaPag: 'Pix' } })
    const nada = await app.inject({ method: 'GET', url: '/api/v1/vendas/em-aberto' })
    expect(nada.json().data).toHaveLength(0)
    expect(nada.json().meta.totalEmAberto).toBe(0)

    await app.close()
  })

  it('valorRecebido maior que o total retorna 400 e não grava a venda', async () => {
    const app = await buildApp()
    const ana = await criarCliente('Ana', '92911111111')
    const res = await app.inject({
      method: 'POST', url: '/api/v1/vendas',
      payload: { clienteId: ana.id, formaPag: 'Pix', itens: [{ nome: 'Ração', qtd: 1, valorUnitario: 100 }], valorRecebido: 150 },
    })
    expect(res.statusCode).toBe(400)
    expect(await prismaTest.venda.count()).toBe(0)
    await app.close()
  })
})
