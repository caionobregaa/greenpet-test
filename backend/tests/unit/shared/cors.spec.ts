import { describe, it, expect, afterEach } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '@/shared/infrastructure/http/fastify-app'
import { CreateEstoqueItemSchema } from '@/modules/estoque/infrastructure/http/estoque.schema'

// O sistema (app.beezpet.com.br) chama o backend em outro domínio: o navegador faz o
// preflight e só envia o pedido se o método estiver liberado.
describe('CORS do sistema', () => {
  let app: FastifyInstance
  afterEach(() => app.close())

  it.each(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])('libera %s vindo do sistema', async (metodo) => {
    app = await buildApp({ jwtSecret: 'segredo-de-teste-com-mais-de-32-caracteres' })
    await app.ready()
    const res = await app.inject({
      method: 'OPTIONS',
      url: '/api/v1/produtos/x',
      headers: {
        origin: 'https://app.beezpet.com.br',
        'access-control-request-method': metodo,
        'access-control-request-headers': 'authorization,content-type',
      },
    })
    expect(res.statusCode).toBe(204)
    expect(res.headers['access-control-allow-origin']).toBe('https://app.beezpet.com.br')
    expect(String(res.headers['access-control-allow-methods']).split(/,\s*/)).toContain(metodo)
  })
})

describe('Lote de estoque sem validade', () => {
  it('aceita validade nula, como o sistema envia', () => {
    const r = CreateEstoqueItemSchema.safeParse({ produtoId: '6896c84f-8cca-4b59-a123-1d541282cbf3', quantidade: 1, validade: null })
    expect(r.success).toBe(true)
    expect(r.data?.validade).toBeUndefined()
  })
})
