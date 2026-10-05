import { describe, it, expect, beforeEach, afterAll } from 'vitest'
import Fastify from 'fastify'
import { prismaTest, truncateAll } from '../../helpers/prisma-test-client.js'
import { registerRecompraRoutes } from '@/modules/recompra/infrastructure/http/recompra.routes'
import { registerDashboardOperacionalRoutes } from '@/modules/dashboard-operacional/infrastructure/http/dashboard-operacional.routes'
import { registerBiAvancadoRoutes } from '@/modules/bi-avancado/infrastructure/http/bi-avancado.routes'
import { errorHandler } from '@/shared/infrastructure/http/error-handler'

// specs/recompra/spec-v2.md + specs/bi-avancado/spec-v3.md
const DIA_MS = 24 * 60 * 60 * 1000
const USUARIO = 'caio@beezpet.com'

async function buildApp() {
  const app = Fastify()
  app.setErrorHandler(errorHandler)
  app.decorateRequest('user', null)
  app.addHook('onRequest', async (req) => {
    ;(req as unknown as { user: { email: string } }).user = { email: USUARIO }
  })
  registerRecompraRoutes(app, prismaTest)
  registerDashboardOperacionalRoutes(app, prismaTest)
  registerBiAvancadoRoutes(app, prismaTest)
  await app.ready()
  return app
}

let seq = 0
async function criarClienteEProduto() {
  seq++
  const cliente = await prismaTest.cliente.create({ data: { nome: `Maria ${seq}`, telefone: `9299100000${seq}` } })
  const produto = await prismaTest.produto.create({
    data: { nome: `Ração ${seq}`, sku: `RAC-9${String(seq).padStart(3, '0')}`, categoria: 'Ração', valorVenda: 100 },
  })
  return { cliente, produto }
}

/** Venda do produto com previsão de recompra para `diasAteRecompra` a partir de hoje (negativo = vencido). */
async function venderComRecompra(clienteId: string, produtoId: string, dataVenda: Date, diasAteRecompra: number) {
  const recompraData = new Date(Date.now() + diasAteRecompra * DIA_MS)
  return prismaTest.venda.create({
    data: {
      data: dataVenda,
      clienteId,
      formaPag: 'Pix',
      total: 100,
      itens: { create: [{ produtoId, nome: 'Ração', qtd: 1, valorUnitario: 100, total: 100, recompraData }] },
    },
  })
}

function ciclo(a: { clienteId: string; produtoId: string; animalId?: string; ultimaCompra: string }) {
  return { clienteId: a.clienteId, produtoId: a.produtoId, animalId: a.animalId ?? '', ultimaCompra: a.ultimaCompra }
}

type Alerta = { clienteId: string; produtoId: string; animalId?: string; ultimaCompra: string; mensagemEnviadaEm: string | null; mensagemEnviadaPor: string | null; clienteTelefone: string; motivosSumido: { motivos: string[] } | null }

describe('Recompra — lembrete de mensagem e clientes sumidos', () => {
  beforeEach(async () => {
    await truncateAll()
  })

  afterAll(async () => {
    await prismaTest.$disconnect()
  })

  it('marcar mensagem enviada não tira o alerta de atrasados nem de sumidos; DELETE desfaz', async () => {
    const { cliente, produto } = await criarClienteEProduto()
    await venderComRecompra(cliente.id, produto.id, new Date(Date.now() - 80 * DIA_MS), -40)
    const app = await buildApp()

    const [alerta] = (await app.inject({ method: 'GET', url: '/api/v1/recompra' })).json().data as Alerta[]
    expect(alerta.clienteTelefone).toBe(cliente.telefone)
    expect(alerta.mensagemEnviadaEm).toBeNull()

    expect((await app.inject({ method: 'POST', url: '/api/v1/recompra/contato', payload: ciclo(alerta) })).statusCode).toBe(204)
    expect((await app.inject({ method: 'POST', url: '/api/v1/recompra/contato', payload: ciclo(alerta) })).statusCode).toBe(204)
    expect(await prismaTest.recompraContato.count()).toBe(1)

    const depois = (await app.inject({ method: 'GET', url: '/api/v1/recompra' })).json().data as Alerta[]
    expect(depois).toHaveLength(1)
    expect(depois[0].mensagemEnviadaEm).not.toBeNull()
    expect(depois[0].mensagemEnviadaPor).toBe(USUARIO)

    const dash = (await app.inject({ method: 'GET', url: '/api/v1/dashboard-operacional' })).json().data
    expect(dash.recompraAtrasada.total).toBe(1)
    expect(dash.clientesSumidos.total).toBe(1)
    expect(dash.alertasRecompra.total).toBe(1)

    const sumidos = (await app.inject({ method: 'GET', url: '/api/v1/recompra/sumidos' })).json().data
    expect(sumidos).toHaveLength(1)

    expect((await app.inject({ method: 'DELETE', url: '/api/v1/recompra/contato', payload: ciclo(alerta) })).statusCode).toBe(204)
    const desfeito = (await app.inject({ method: 'GET', url: '/api/v1/recompra' })).json().data as Alerta[]
    expect(desfeito[0].mensagemEnviadaEm).toBeNull()
  })

  it('nova venda do produto inicia ciclo novo: mensagem pendente e cliente fora dos sumidos', async () => {
    const { cliente, produto } = await criarClienteEProduto()
    await venderComRecompra(cliente.id, produto.id, new Date(Date.now() - 80 * DIA_MS), -40)
    const app = await buildApp()
    const [alerta] = (await app.inject({ method: 'GET', url: '/api/v1/recompra' })).json().data as Alerta[]
    await app.inject({ method: 'POST', url: '/api/v1/recompra/contato', payload: ciclo(alerta) })

    await venderComRecompra(cliente.id, produto.id, new Date(), 5)

    const [novo] = (await app.inject({ method: 'GET', url: '/api/v1/recompra' })).json().data as Alerta[]
    expect(novo.mensagemEnviadaEm).toBeNull()
    const sumidos = (await app.inject({ method: 'GET', url: '/api/v1/recompra/sumidos' })).json().data
    expect(sumidos).toHaveLength(0)
    const dash = (await app.inject({ method: 'GET', url: '/api/v1/dashboard-operacional' })).json().data
    expect(dash.recompraAtrasada.total).toBe(0)
    expect(dash.alertasRecompra.total).toBe(1)
  })

  it('GET /sumidos traz só vencidos há mais de 30 dias; dashboard traz só alertas de até 10 dias', async () => {
    const a = await criarClienteEProduto()
    const b = await criarClienteEProduto()
    const c = await criarClienteEProduto()
    await venderComRecompra(a.cliente.id, a.produto.id, new Date(Date.now() - 90 * DIA_MS), -45) // sumido
    await venderComRecompra(b.cliente.id, b.produto.id, new Date(Date.now() - 30 * DIA_MS), -5) // atrasado, não sumido
    await venderComRecompra(c.cliente.id, c.produto.id, new Date(), 20) // no prazo
    const app = await buildApp()

    const sumidos = (await app.inject({ method: 'GET', url: '/api/v1/recompra/sumidos' })).json().data
    expect(sumidos.map((s: { clienteId: string }) => s.clienteId)).toEqual([a.cliente.id])
    expect(sumidos[0].diasAtraso).toBeGreaterThan(30)

    const dash = (await app.inject({ method: 'GET', url: '/api/v1/dashboard-operacional' })).json().data
    expect(dash.alertasRecompra.total).toBe(2)
  })

  it('PUT motivos valida, grava, substitui no mesmo ciclo e alimenta o BI', async () => {
    const { cliente, produto } = await criarClienteEProduto()
    await venderComRecompra(cliente.id, produto.id, new Date(Date.now() - 90 * DIA_MS), -45)
    const app = await buildApp()
    const [sumido] = (await app.inject({ method: 'GET', url: '/api/v1/recompra/sumidos' })).json().data as Alerta[]
    const put = (payload: object) => app.inject({ method: 'PUT', url: '/api/v1/recompra/sumidos/motivos', payload: { ...ciclo(sumido), ...payload } })

    for (const invalido of [{ motivos: [] }, { motivos: ['Chuva'] }, { motivos: ['Outro'] }]) {
      const res = await put(invalido)
      expect(res.statusCode).toBe(400)
      expect(res.json().error.code).toBe('VALIDATION_ERROR')
    }

    expect((await put({ motivos: ['Preço', 'Outro'], outroTexto: 'achou no atacado' })).statusCode).toBe(200)
    expect((await put({ motivos: ['Mudou de cidade'] })).statusCode).toBe(200)
    expect(await prismaTest.clienteSumidoMotivo.count()).toBe(1)

    const [comMotivo] = (await app.inject({ method: 'GET', url: '/api/v1/recompra/sumidos' })).json().data as Alerta[]
    expect(comMotivo.motivosSumido?.motivos).toEqual(['Mudou de cidade'])

    const hoje = new Date().toISOString().slice(0, 10)
    const bi = (await app.inject({ method: 'GET', url: `/api/v1/bi/avancado?inicio=${hoje}&fim=${hoje}` })).json().data
    expect(bi.motivosClientesSumidos).toEqual({
      totalRegistros: 1,
      motivos: [{ motivo: 'Mudou de cidade', quantidade: 1, percentual: 100 }],
    })
  })

  it('PUT motivos para quem não está sumido retorna 422 NOT_SUMIDO', async () => {
    const { cliente, produto } = await criarClienteEProduto()
    await venderComRecompra(cliente.id, produto.id, new Date(Date.now() - 30 * DIA_MS), -5)
    const app = await buildApp()
    const [alerta] = (await app.inject({ method: 'GET', url: '/api/v1/recompra' })).json().data as Alerta[]

    const res = await app.inject({ method: 'PUT', url: '/api/v1/recompra/sumidos/motivos', payload: { ...ciclo(alerta), motivos: ['Preço'] } })

    expect(res.statusCode).toBe(422)
    expect(res.json().error.code).toBe('NOT_SUMIDO')
  })
})
