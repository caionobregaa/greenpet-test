import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { buildApp } from '@/shared/infrastructure/http/fastify-app'
import { registerCatalogoRoutes } from '@/modules/catalogo/infrastructure/http/catalogo.routes'
import { interpretarImagem } from '@/modules/catalogo/domain/catalogo-imagem'
import { Produto } from '@/modules/produtos/domain/entities/produto.entity'

// specs/catalogo/spec-v1.md e specs/produtos/spec-v7.md
const ATUALIZADO = new Date('2026-11-02T12:00:00.000Z')
const JPEG = `data:image/jpeg;base64,${Buffer.from('foto').toString('base64')}`

const CAMPOS_INTERNOS = [
  'valorCusto', 'margemCalculada', 'margemCartao', 'margemImposto', 'margemOperacao', 'margemLucro',
  'fornecedor', 'estoque', 'estoqueMinimo', 'sku', 'codigoBarras', 'semCodigoBarras', 'diasRecompra',
  'descricao', 'ocultarCatalogo', 'deletedAt', 'temImagem', 'atualizadoEm',
]

describe('interpretarImagem', () => {
  it('base64 de imagem permitida vira arquivo', () => {
    expect(interpretarImagem(JPEG)).toEqual({ tipo: 'arquivo', contentType: 'image/jpeg', bytes: Buffer.from('foto') })
  })

  it.each([
    ['SVG, que pode carregar script', 'data:image/svg+xml;base64,PHN2Zz4='],
    ['HTML', 'data:text/html;base64,PGI+'],
    ['sem base64', 'data:image/png,abc'],
    ['sem conteúdo', 'data:image/png;base64,'],
    ['sem vírgula', 'data:image/png;base64'],
    ['texto solto', 'foto.png'],
    ['caminho para outro domínio', '//malicioso.com/x.png'],
  ])('recusa %s', (_nome, valor) => {
    expect(interpretarImagem(valor)).toBeNull()
  })

  it('URL externa redireciona para ela', () => {
    expect(interpretarImagem('https://cdn.exemplo.com/a.png')).toEqual({ tipo: 'redirecionar', url: 'https://cdn.exemplo.com/a.png' })
  })

  it('caminho de cadastro antigo redireciona para o sistema', () => {
    expect(interpretarImagem('/uploads/a.png')).toEqual({ tipo: 'redirecionar', url: 'https://app.beezpet.com.br/uploads/a.png' })
  })
})

describe('Rotas públicas do catálogo', () => {
  let app: FastifyInstance
  const queryRaw = vi.fn()
  const findFirst = vi.fn()
  const promocoes = vi.fn()

  beforeEach(async () => {
    queryRaw.mockReset()
    findFirst.mockReset()
    promocoes.mockReset()
    promocoes.mockResolvedValue([])
    app = await buildApp({ jwtSecret: 'segredo-de-teste-com-mais-de-32-caracteres' })
    registerCatalogoRoutes(app, { $queryRaw: queryRaw, produto: { findFirst }, promocaoItem: { findMany: promocoes } } as unknown as PrismaClient)
    // Rota privada de controle: prova que o hook de login segue ativo neste app.
    app.get('/privada', async () => ({ ok: true }))
    await app.ready()
  })

  afterEach(() => app.close())

  it('lista responde sem login, enquanto uma rota privada exige', async () => {
    queryRaw.mockResolvedValue([])
    expect((await app.inject({ url: '/api/v1/catalogo/produtos' })).statusCode).toBe(200)
    expect((await app.inject({ url: '/privada' })).statusCode).toBe(401)
  })

  it('lista expõe só os campos públicos, mesmo se a consulta trouxer campos internos', async () => {
    queryRaw.mockResolvedValue([{
      id: 'p1', nome: 'Ração X', categoria: 'Ração', especie: 'Cão', valorVenda: '189.90',
      temImagem: true, atualizadoEm: ATUALIZADO, valorCusto: 100, fornecedor: 'MARKET', estoque: 3, sku: 'RAC-0001',
    }])
    const res = await app.inject({ url: '/api/v1/catalogo/produtos' })
    const [produto] = res.json().data
    expect(produto).toEqual({
      id: 'p1', nome: 'Ração X', categoria: 'Ração', especie: 'Cão', valorVenda: 189.9,
      valorOriginal: null, promocaoFim: null,
      imagemUrl: `/api/v1/catalogo/produtos/p1/imagem?v=${ATUALIZADO.getTime()}`,
    })
    for (const campo of CAMPOS_INTERNOS) expect(produto).not.toHaveProperty(campo)
  })

  it('produto em promoção ativa vende pelo preço promocional e mostra o normal riscado', async () => {
    const fim = new Date('2026-11-18T03:59:59.999Z')
    queryRaw.mockResolvedValue([{ id: 'p1', nome: 'A', categoria: 'Ração', especie: null, valorVenda: 189.9, temImagem: false, atualizadoEm: ATUALIZADO }])
    promocoes.mockResolvedValue([{ produtoId: 'p1', valorPromocional: '159.90', promocao: { id: 'c1', nome: 'Semana', fim } }])
    const [produto] = (await app.inject({ url: '/api/v1/catalogo/produtos' })).json().data
    expect(produto).toMatchObject({ valorVenda: 159.9, valorOriginal: 189.9, promocaoFim: fim.toISOString() })
    expect(produto).not.toHaveProperty('campanhaId')
  })

  it('produto sem foto vem com imagemUrl null', async () => {
    queryRaw.mockResolvedValue([{ id: 'p2', nome: 'B', categoria: 'Higiene', especie: null, valorVenda: 10, temImagem: false, atualizadoEm: ATUALIZADO }])
    expect((await app.inject({ url: '/api/v1/catalogo/produtos' })).json().data[0].imagemUrl).toBeNull()
  })

  it('foto em base64 é devolvida como arquivo, sem login e com cache longo', async () => {
    findFirst.mockResolvedValue({ imagemUrl: JPEG })
    const res = await app.inject({ url: '/api/v1/catalogo/produtos/p1/imagem?v=1' })
    expect(res.statusCode).toBe(200)
    expect(res.headers['content-type']).toBe('image/jpeg')
    expect(res.headers['cache-control']).toContain('immutable')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.rawPayload.toString()).toBe('foto')
  })

  it('a busca da foto só alcança produto publicado', async () => {
    findFirst.mockResolvedValue(null)
    await app.inject({ url: '/api/v1/catalogo/produtos/p1/imagem' })
    expect(findFirst.mock.calls[0][0].where).toEqual({
      id: 'p1', deletedAt: null, ocultarCatalogo: false, categoria: { not: 'Serviço' },
    })
  })

  it('foto em caminho antigo redireciona para o sistema', async () => {
    findFirst.mockResolvedValue({ imagemUrl: '/uploads/a.png' })
    const res = await app.inject({ url: '/api/v1/catalogo/produtos/p1/imagem' })
    expect(res.statusCode).toBe(302)
    expect(res.headers.location).toBe('https://app.beezpet.com.br/uploads/a.png')
  })

  it.each([
    ['produto fora do catálogo', null],
    ['produto sem foto', { imagemUrl: null }],
    ['formato recusado', { imagemUrl: 'data:image/svg+xml;base64,PHN2Zz4=' }],
  ])('foto responde 404 com %s', async (_nome, row) => {
    findFirst.mockResolvedValue(row)
    expect((await app.inject({ url: '/api/v1/catalogo/produtos/p1/imagem' })).statusCode).toBe(404)
  })
})

describe('Produto.ocultarCatalogo', () => {
  const base = { nome: 'Ração', sku: 'RAC-0001', categoria: 'Ração', valorVenda: 10 }

  it('nasce visível por padrão', () => {
    expect(Produto.create(base).ocultarCatalogo).toBe(false)
  })

  it('pode ocultar e voltar a mostrar', () => {
    const p = Produto.create(base)
    p.update({ ocultarCatalogo: true })
    expect(p.ocultarCatalogo).toBe(true)
    p.update({ ocultarCatalogo: false })
    expect(p.ocultarCatalogo).toBe(false)
  })

  it('editar outro campo não muda a marcação', () => {
    const p = Produto.create({ ...base, ocultarCatalogo: true })
    p.update({ valorVenda: 20 })
    expect(p.ocultarCatalogo).toBe(true)
  })
})
