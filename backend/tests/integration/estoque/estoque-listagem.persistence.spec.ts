import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import Fastify from 'fastify'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { registerEstoqueRoutes } from '@/modules/estoque/infrastructure/http/estoque.routes'
import { errorHandler } from '@/shared/infrastructure/http/error-handler'

// specs/estoque/spec-v1.md — listagem em ordem alfabética com dados para os filtros da tela.
let skuSeq = 0
async function criarProduto(nome: string, extra: { especie?: string; fornecedor?: string } = {}) {
  skuSeq++
  return prismaTest.produto.create({
    data: { nome, sku: `MED-${String(skuSeq).padStart(4, '0')}`, categoria: 'Medicamento', valorVenda: 100, ...extra },
  })
}

async function criarLote(produtoId: string, validade: string | null) {
  await prismaTest.estoqueItem.create({
    data: { produtoId, quantidade: 1, validade: validade ? new Date(validade) : null },
  })
}

async function buildApp() {
  const app = Fastify()
  app.setErrorHandler(errorHandler)
  registerEstoqueRoutes(app, prismaTest)
  await app.ready()
  return app
}

describe('GET /api/v1/estoque', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await prismaTest.$disconnect()
  })

  it('ordena pelo nome do produto e, no mesmo produto, pela validade mais próxima', async () => {
    const simparic = await criarProduto('Simparic 40mg')
    const bravecto = await criarProduto('Bravecto 500mg', { especie: 'Cão', fornecedor: 'Market' })
    const apoquel = await criarProduto('Apoquel 16mg')
    await criarLote(simparic.id, '2026-10-01')
    await criarLote(bravecto.id, '2027-06-01')
    await criarLote(bravecto.id, '2026-12-01')
    await criarLote(apoquel.id, '2028-01-01')
    const app = await buildApp()

    const res = await app.inject({ method: 'GET', url: '/api/v1/estoque?limit=1000' })

    expect(res.statusCode).toBe(200)
    const itens = res.json().data as Array<{ produto: { nome: string; especie: string | null; fornecedor: string | null }; validade: string }>
    expect(itens.map((i) => i.produto.nome)).toEqual(['Apoquel 16mg', 'Bravecto 500mg', 'Bravecto 500mg', 'Simparic 40mg'])
    expect(itens[1].validade.slice(0, 10)).toBe('2026-12-01')
    expect(itens[2].validade.slice(0, 10)).toBe('2027-06-01')
    expect(itens[1].produto).toMatchObject({ especie: 'Cão', fornecedor: 'Market' })
  })

  it('limit acima de 1000 retorna 400 VALIDATION_ERROR', async () => {
    const app = await buildApp()

    const res = await app.inject({ method: 'GET', url: '/api/v1/estoque?limit=1001' })

    expect(res.statusCode).toBe(400)
    expect(res.json().error.code).toBe('VALIDATION_ERROR')
  })
})
