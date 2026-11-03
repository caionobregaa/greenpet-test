import { describe, it, expect, afterEach } from 'vitest'
import Fastify, { type FastifyInstance } from 'fastify'
import { errorHandler } from '@/shared/infrastructure/http/error-handler'

describe('errorHandler com erros do Fastify', () => {
  let app: FastifyInstance
  afterEach(() => app.close())

  async function montar() {
    app = Fastify()
    app.setErrorHandler(errorHandler)
    app.post('/eco', async (req) => ({ corpo: req.body }))
    await app.ready()
  }

  it('content-type não suportado devolve 415 sem detalhes internos', async () => {
    await montar()
    const res = await app.inject({ method: 'POST', url: '/eco', headers: { 'content-type': 'application/x-desconhecido' }, payload: 'x' })
    expect(res.statusCode).toBe(415)
    expect(res.json()).toEqual({ error: { code: 'REQUISICAO_INVALIDA', message: 'Requisição inválida' } })
  })

  it('JSON vazio com content-type continua 400', async () => {
    await montar()
    const res = await app.inject({ method: 'POST', url: '/eco', headers: { 'content-type': 'application/json' } })
    expect(res.statusCode).toBe(400)
  })

  it('erro desconhecido continua 500', async () => {
    app = Fastify()
    app.setErrorHandler(errorHandler)
    app.get('/quebra', async () => { throw new Error('falha') })
    await app.ready()
    const original = console.error
    console.error = () => {}
    const res = await app.inject({ url: '/quebra' })
    console.error = original
    expect(res.statusCode).toBe(500)
    expect(res.json().error.code).toBe('INTERNAL_ERROR')
  })
})
