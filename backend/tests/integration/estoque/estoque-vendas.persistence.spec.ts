import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import Fastify from 'fastify'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { registerVendasRoutes } from '@/modules/vendas/infrastructure/http/vendas.routes'
import { registerEstoqueRoutes } from '@/modules/estoque/infrastructure/http/estoque.routes'
import { registerOrcamentosRoutes } from '@/modules/orcamentos/infrastructure/http/orcamentos.routes'
import { errorHandler } from '@/shared/infrastructure/http/error-handler'

// specs/estoque/spec-v2.md — baixa pelas vendas, edição, exclusão, diagnóstico e correção retroativa.

async function buildApp() {
  const app = Fastify()
  app.setErrorHandler(errorHandler)
  registerVendasRoutes(app, prismaTest)
  registerEstoqueRoutes(app, prismaTest)
  registerOrcamentosRoutes(app, prismaTest)
  await app.ready()
  return app
}

let seq = 0
async function criarProduto(nome: string) {
  seq++
  return prismaTest.produto.create({ data: { nome, sku: `RAC-${String(seq).padStart(4, '0')}`, categoria: 'Ração', valorVenda: 100 } })
}

async function criarLote(produtoId: string, quantidade: number, extra: { validade?: string; createdAt?: Date } = {}) {
  return prismaTest.estoqueItem.create({
    data: { produtoId, quantidade, validade: extra.validade ? new Date(extra.validade) : null, createdAt: extra.createdAt },
  })
}

async function estoqueDe(produtoId: string): Promise<number> {
  const r = await prismaTest.estoqueItem.aggregate({ where: { produtoId }, _sum: { quantidade: true } })
  return r._sum.quantidade ?? 0
}

describe('Estoque × vendas (spec-v2)', () => {
  let clienteId: string

  beforeEach(async () => {
    await truncateAll()
    clienteId = (await prismaTest.cliente.create({ data: { nome: 'Ana', telefone: '92911111111' } })).id
  })

  afterAll(async () => {
    await prismaTest.$disconnect()
  })

  function vender(app: Awaited<ReturnType<typeof buildApp>>, itens: Array<Record<string, unknown>>) {
    return app.inject({ method: 'POST', url: '/api/v1/vendas', payload: { clienteId, formaPag: 'Pix', itens } })
  }

  it('venda com estoque suficiente tira a quantidade (validade mais próxima primeiro) e grava qtdBaixada', async () => {
    const app = await buildApp()
    const racao = await criarProduto('Ração A')
    const longe = await criarLote(racao.id, 5, { validade: '2027-06-01' })
    await criarLote(racao.id, 2, { validade: '2026-12-01' })

    const res = await vender(app, [{ produtoId: racao.id, nome: 'Ração A', qtd: 3, valorUnitario: 100 }])
    expect(res.statusCode).toBe(201)
    expect(res.json().data.avisosEstoque).toEqual([])
    expect(await estoqueDe(racao.id)).toBe(4)
    // O lote mais próximo (2) zerou e foi removido; o outro perdeu 1
    expect((await prismaTest.estoqueItem.findUnique({ where: { id: longe.id } }))!.quantidade).toBe(4)
    const item = await prismaTest.vendaItem.findFirst({ where: { vendaId: res.json().data.id } })
    expect(item!.qtdBaixada).toBe(3)
    await app.close()
  })

  it('estoque insuficiente: registra a venda, tira o que existe e avisa', async () => {
    const app = await buildApp()
    const racao = await criarProduto('Ração B')
    await criarLote(racao.id, 1)

    const res = await vender(app, [{ produtoId: racao.id, nome: 'Ração B', qtd: 3, valorUnitario: 100 }])
    expect(res.statusCode).toBe(201)
    expect(res.json().data.avisosEstoque).toEqual([{ produtoId: racao.id, nome: 'Ração B', qtd: 3, qtdBaixada: 1 }])
    expect(await estoqueDe(racao.id)).toBe(0)
    await app.close()
  })

  it('editar: aumentar tira a diferença, diminuir devolve, mudar só a observação não mexe', async () => {
    const app = await buildApp()
    const racao = await criarProduto('Ração C')
    await criarLote(racao.id, 10)
    const venda = (await vender(app, [{ produtoId: racao.id, nome: 'Ração C', qtd: 2, valorUnitario: 100 }])).json().data
    expect(await estoqueDe(racao.id)).toBe(8)

    const editar = (qtd: number, obs?: string) => app.inject({
      method: 'PATCH', url: `/api/v1/vendas/${venda.id}`,
      payload: { obs, itens: [{ produtoId: racao.id, nome: 'Ração C', qtd, valorUnitario: 100 }] },
    })

    expect((await editar(5)).statusCode).toBe(200)
    expect(await estoqueDe(racao.id)).toBe(5)

    await editar(1)
    expect(await estoqueDe(racao.id)).toBe(9)
    const estorno = await prismaTest.estoqueItem.findFirst({ where: { produtoId: racao.id, obs: { startsWith: 'Estorno da venda' } } })
    expect(estorno!.quantidade).toBe(4)

    await editar(1, 'só a observação')
    expect(await estoqueDe(racao.id)).toBe(9)

    // Registrar recebimento também regrava a venda e não pode mexer no estoque
    await prismaTest.venda.update({ where: { id: venda.id }, data: { valorRecebido: 0 } })
    await app.inject({ method: 'POST', url: `/api/v1/vendas/${venda.id}/pagamentos`, payload: { valor: 10, formaPag: 'Pix' } })
    expect(await estoqueDe(racao.id)).toBe(9)
    await app.close()
  })

  it('editar trocando de produto devolve o antigo e tira o novo', async () => {
    const app = await buildApp()
    const a = await criarProduto('Ração D')
    const b = await criarProduto('Ração E')
    await criarLote(a.id, 5)
    await criarLote(b.id, 5)
    const venda = (await vender(app, [{ produtoId: a.id, nome: 'Ração D', qtd: 2, valorUnitario: 100 }])).json().data

    await app.inject({
      method: 'PATCH', url: `/api/v1/vendas/${venda.id}`,
      payload: { itens: [{ produtoId: b.id, nome: 'Ração E', qtd: 2, valorUnitario: 100 }] },
    })
    expect(await estoqueDe(a.id)).toBe(5)
    expect(await estoqueDe(b.id)).toBe(3)
    await app.close()
  })

  it('excluir devolve o que a venda tirou (e só isso, quando faltou estoque)', async () => {
    const app = await buildApp()
    const racao = await criarProduto('Ração F')
    await criarLote(racao.id, 1)
    const venda = (await vender(app, [{ produtoId: racao.id, nome: 'Ração F', qtd: 3, valorUnitario: 100 }])).json().data

    const res = await app.inject({ method: 'DELETE', url: `/api/v1/vendas/${venda.id}` })
    expect(res.statusCode).toBe(204)
    expect(await estoqueDe(racao.id)).toBe(1)
    await app.close()
  })

  it('item pendente (venda antiga, qtdBaixada vazio) não é ajustado na edição nem devolvido na exclusão', async () => {
    const app = await buildApp()
    const racao = await criarProduto('Ração G')
    await criarLote(racao.id, 10)
    const venda = (await vender(app, [{ produtoId: racao.id, nome: 'Ração G', qtd: 2, valorUnitario: 100 }])).json().data
    await prismaTest.vendaItem.updateMany({ where: { vendaId: venda.id }, data: { qtdBaixada: null } })

    await app.inject({
      method: 'PATCH', url: `/api/v1/vendas/${venda.id}`,
      payload: { itens: [{ produtoId: racao.id, nome: 'Ração G', qtd: 4, valorUnitario: 100 }] },
    })
    expect(await estoqueDe(racao.id)).toBe(8)
    expect((await prismaTest.vendaItem.findFirst({ where: { vendaId: venda.id } }))!.qtdBaixada).toBeNull()

    await app.inject({ method: 'DELETE', url: `/api/v1/vendas/${venda.id}` })
    expect(await estoqueDe(racao.id)).toBe(8)
    await app.close()
  })

  it('converter orçamento tira do estoque e avisa o que faltou', async () => {
    const app = await buildApp()
    const racao = await criarProduto('Ração H')
    await criarLote(racao.id, 1)
    const orc = await app.inject({
      method: 'POST', url: '/api/v1/orcamentos',
      payload: { clienteId, validade: '2026-12-31', itens: [{ produtoId: racao.id, nome: 'Ração H', qtd: 2, valorUnitario: 100 }] },
    })
    expect(orc.statusCode).toBe(201)
    const res = await app.inject({ method: 'POST', url: `/api/v1/orcamentos/${orc.json().data.id}/converter`, payload: { formaPag: 'Pix' } })
    expect(res.statusCode).toBe(201)
    expect(res.json().data.avisosEstoque).toEqual([{ produtoId: racao.id, nome: 'Ração H', qtd: 2, qtdBaixada: 1 }])
    expect(await estoqueDe(racao.id)).toBe(0)
    await app.close()
  })

  it('diagnóstico lista itens sem produto, baixas incompletas, nomes repetidos e pendentes', async () => {
    const app = await buildApp()
    const racao = await criarProduto('Ração I')
    await criarProduto('ração i ')
    await criarLote(racao.id, 1)
    await vender(app, [
      { produtoId: racao.id, nome: 'Ração I', qtd: 2, valorUnitario: 100 },
      { nome: 'Banho e tosa', qtd: 1, valorUnitario: 50 },
    ])
    const antiga = (await vender(app, [{ produtoId: racao.id, nome: 'Ração I', qtd: 3, valorUnitario: 100 }])).json().data
    await prismaTest.vendaItem.updateMany({ where: { vendaId: antiga.id }, data: { qtdBaixada: null } })

    const res = await app.inject({ method: 'GET', url: '/api/v1/estoque/diagnostico' })
    expect(res.statusCode).toBe(200)
    const d = res.json().data
    expect(d.itensSemProduto).toMatchObject([{ nome: 'Banho e tosa', qtd: 1 }])
    expect(d.baixasIncompletas).toMatchObject([{ produtoNome: 'Ração I', qtd: 2, qtdBaixada: 1 }])
    expect(d.produtosDuplicados).toHaveLength(1)
    expect(d.produtosDuplicados[0].produtos).toHaveLength(2)
    expect(d.pendentesCorrecao).toEqual({ itens: 1, unidades: 3 })
    await app.close()
  })

  it('correção retroativa: simular não muda nada; aplicar usa só lotes que já existiam e não repete', async () => {
    const app = await buildApp()
    const racao = await criarProduto('Ração J')
    const antes = new Date('2026-05-01T12:00:00Z')
    const depois = new Date('2026-07-01T12:00:00Z')
    await criarLote(racao.id, 5, { createdAt: new Date('2026-04-01T12:00:00Z') })
    await criarLote(racao.id, 10, { createdAt: depois }) // compra lançada depois da venda antiga

    const venda = (await vender(app, [{ produtoId: racao.id, nome: 'Ração J', qtd: 3, valorUnitario: 100 }])).json().data
    // Simula venda antiga: registrada antes da baixa automática e sem baixa feita
    await prismaTest.venda.update({ where: { id: venda.id }, data: { createdAt: antes } })
    await prismaTest.vendaItem.updateMany({ where: { vendaId: venda.id }, data: { qtdBaixada: null } })
    await prismaTest.estoqueItem.deleteMany({ where: { produtoId: racao.id } })
    await criarLote(racao.id, 5, { createdAt: new Date('2026-04-01T12:00:00Z') })
    await criarLote(racao.id, 10, { createdAt: depois })

    const simulacao = await app.inject({ method: 'POST', url: '/api/v1/estoque/correcao-retroativa', payload: { aplicar: false } })
    expect(simulacao.statusCode).toBe(200)
    expect(simulacao.json().data).toMatchObject({ aplicado: false, totalItens: 1, totalUnidades: 3 })
    expect(await estoqueDe(racao.id)).toBe(15)
    expect((await prismaTest.vendaItem.findFirst({ where: { vendaId: venda.id } }))!.qtdBaixada).toBeNull()

    const aplicada = await app.inject({ method: 'POST', url: '/api/v1/estoque/correcao-retroativa', payload: { aplicar: true } })
    expect(aplicada.json().data).toMatchObject({ aplicado: true, totalItens: 1, totalUnidades: 3 })
    expect(await estoqueDe(racao.id)).toBe(12)
    // O lote lançado depois da venda ficou intacto
    expect((await prismaTest.estoqueItem.findFirst({ where: { produtoId: racao.id, createdAt: depois } }))!.quantidade).toBe(10)

    const denovo = await app.inject({ method: 'POST', url: '/api/v1/estoque/correcao-retroativa', payload: { aplicar: true } })
    expect(denovo.json().data.totalItens).toBe(0)
    expect(await estoqueDe(racao.id)).toBe(12)
    await app.close()
  })
})
