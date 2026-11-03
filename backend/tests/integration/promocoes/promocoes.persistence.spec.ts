import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import Fastify from 'fastify'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { errorHandler } from '@/shared/infrastructure/http/error-handler'
import { registerPromocoesRoutes } from '@/modules/promocoes/infrastructure/http/promocoes.routes'
import { registerCatalogoRoutes } from '@/modules/catalogo/infrastructure/http/catalogo.routes'
import { registerProdutosRoutes } from '@/modules/produtos/infrastructure/http/produtos.routes'
import { buscarPromocoesAtivas } from '@/modules/promocoes/infrastructure/promocoes-ativas'
import { PrismaProdutoRepository } from '@/modules/produtos/infrastructure/repositories/prisma-produto.repository'
import { CreateProdutoUseCase } from '@/modules/produtos/application/use-cases/create-produto.use-case'
import { dataManaus } from '@/modules/promocoes/domain/promocao'

// specs/promocoes/spec-v1.md: campanha no banco real, refletindo em produtos e no catálogo.
async function montarApp() {
  const app = Fastify()
  app.setErrorHandler(errorHandler)
  registerPromocoesRoutes(app, prismaTest)
  registerCatalogoRoutes(app, prismaTest)
  registerProdutosRoutes(app, prismaTest)
  await app.ready()
  return app
}

const hoje = () => dataManaus(new Date())
const diasDepois = (n: number) => dataManaus(new Date(Date.now() + n * 86_400_000))

describe('Promoções — persistência e efeito nos preços', () => {
  let racaoId: string
  let sacheId: string

  beforeEach(async () => {
    await truncateAll()
    const criar = new CreateProdutoUseCase(new PrismaProdutoRepository(prismaTest))
    racaoId = (await criar.execute({ nome: 'Ração Golden 10kg', categoria: 'Ração', valorVenda: 189.9, valorCusto: 120 })).id
    sacheId = (await criar.execute({ nome: 'Sachê 85g', categoria: 'Petisco', valorVenda: 3.9 })).id
  })

  afterAll(() => prismaTest.$disconnect())

  it('campanha ativa muda o preço no catálogo e em produtos; o preço normal não muda', async () => {
    const app = await montarApp()
    const r = await app.inject({ method: 'POST', url: '/api/v1/promocoes', payload: { nome: 'Semana', inicio: hoje(), fim: diasDepois(3), itens: [{ produtoId: racaoId, valorPromocional: 159.9 }] } })
    expect(r.statusCode).toBe(201)
    expect(r.json().data).toMatchObject({ situacao: 'ativa', itens: [{ nome: 'Ração Golden 10kg', valorPromocional: 159.9, desconto: 16 }] })

    const catalogo = (await app.inject({ url: '/api/v1/catalogo/produtos' })).json().data
    expect(catalogo.find((p: { id: string }) => p.id === racaoId)).toMatchObject({ valorVenda: 159.9, valorOriginal: 189.9 })
    expect(catalogo.find((p: { id: string }) => p.id === sacheId)).toMatchObject({ valorVenda: 3.9, valorOriginal: null, promocaoFim: null })

    const lista = (await app.inject({ url: '/api/v1/produtos?limit=10' })).json().data
    const racao = lista.find((p: { id: string }) => p.id === racaoId)
    expect(racao.valorVenda).toBe(189.9)
    expect(racao.promocao).toMatchObject({ nome: 'Semana', valorPromocional: 159.9 })
    expect((await app.inject({ url: `/api/v1/produtos/${racaoId}` })).json().data.promocao.valorPromocional).toBe(159.9)
  })

  it('campanha agendada não muda nada até começar', async () => {
    const app = await montarApp()
    await app.inject({ method: 'POST', url: '/api/v1/promocoes', payload: { nome: 'Futura', inicio: diasDepois(5), fim: diasDepois(9), itens: [{ produtoId: racaoId, valorPromocional: 150 }] } })
    expect((await app.inject({ url: '/api/v1/promocoes' })).json().data[0].situacao).toBe('agendada')
    expect((await buscarPromocoesAtivas(prismaTest)).size).toBe(0)
    const amanhaDoInicio = new Date(Date.now() + 6 * 86_400_000)
    expect((await buscarPromocoesAtivas(prismaTest, [racaoId], amanhaDoInicio)).get(racaoId)?.valorPromocional).toBe(150)
  })

  it('depois do fim volta ao preço normal sozinha, sem ação manual', async () => {
    const app = await montarApp()
    await app.inject({ method: 'POST', url: '/api/v1/promocoes', payload: { nome: 'Curta', inicio: hoje(), fim: hoje(), itens: [{ produtoId: racaoId, valorPromocional: 150 }] } })
    const depoisDoFim = new Date(Date.now() + 2 * 86_400_000)
    expect((await buscarPromocoesAtivas(prismaTest, undefined, depoisDoFim)).size).toBe(0)
  })

  it('encerrar agora tira o produto da promoção na hora; depois pode excluir', async () => {
    const app = await montarApp()
    const id = (await app.inject({ method: 'POST', url: '/api/v1/promocoes', payload: { nome: 'Semana', inicio: hoje(), fim: diasDepois(3), itens: [{ produtoId: racaoId, valorPromocional: 159.9 }] } })).json().data.id
    expect((await app.inject({ method: 'DELETE', url: `/api/v1/promocoes/${id}` })).statusCode).toBe(422)
    const enc = await app.inject({ method: 'POST', url: `/api/v1/promocoes/${id}/encerrar` })
    expect(enc.json().data.situacao).toBe('encerrada')
    const catalogo = (await app.inject({ url: '/api/v1/catalogo/produtos' })).json().data
    expect(catalogo.find((p: { id: string }) => p.id === racaoId).valorOriginal).toBeNull()
    expect((await app.inject({ method: 'DELETE', url: `/api/v1/promocoes/${id}` })).statusCode).toBe(204)
    expect(await prismaTest.promocaoItem.count()).toBe(0)
  })

  it('recusa sobreposição no banco, e edição troca os itens', async () => {
    const app = await montarApp()
    const id = (await app.inject({ method: 'POST', url: '/api/v1/promocoes', payload: { nome: 'A', inicio: hoje(), fim: diasDepois(3), itens: [{ produtoId: racaoId, valorPromocional: 159.9 }] } })).json().data.id
    const conflito = await app.inject({ method: 'POST', url: '/api/v1/promocoes', payload: { nome: 'B', inicio: diasDepois(2), fim: diasDepois(8), itens: [{ produtoId: racaoId, valorPromocional: 150 }] } })
    expect(conflito.statusCode).toBe(409)
    expect(conflito.json().error.message).toContain('já está na promoção "A"')

    const editada = await app.inject({ method: 'PUT', url: `/api/v1/promocoes/${id}`, payload: { nome: 'A', inicio: hoje(), fim: diasDepois(3), itens: [{ produtoId: sacheId, valorPromocional: 2.99 }] } })
    expect(editada.json().data.itens).toEqual([expect.objectContaining({ nome: 'Sachê 85g', valorPromocional: 2.99 })])
    expect((await app.inject({ url: `/api/v1/promocoes/${id}` })).json().data.itens).toHaveLength(1)
    expect((await app.inject({ url: '/api/v1/promocoes/nao-existe' })).statusCode).toBe(404)
  })

  it('valida o corpo do pedido', async () => {
    const app = await montarApp()
    const r = await app.inject({ method: 'POST', url: '/api/v1/promocoes', payload: { nome: '', inicio: 'x', fim: hoje(), itens: [] } })
    expect(r.statusCode).toBe(400)
  })
})
