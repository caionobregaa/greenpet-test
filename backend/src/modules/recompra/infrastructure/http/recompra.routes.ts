import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { PrismaRecompraRepository } from '../repositories/prisma-recompra.repository.js'
import { ListRecompraAlertasUseCase } from '../../application/use-cases/list-recompra-alertas.use-case.js'
import { z } from 'zod'
import { ValidationError } from '@/shared/errors/validation.error.js'
import { UnprocessableError } from '@/shared/errors/unprocessable.error.js'
import { isSumido, validarMotivosSumido } from '../../domain/services/recompra-alert.service.js'

const QuerySchema = z.object({
  clienteId: z.string().uuid().optional(),
  urgencia: z.enum(['vencido', 'urgente', 'proximo', 'ok']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

const DismissSchema = z.object({
  produtoId: z.string().uuid(),
  clienteId: z.string().uuid(),
  animalId: z.string().optional().default(''),
  reason: z.enum(['ok', 'cancelado']),
})

const ManualSchema = z.object({
  clienteId: z.string().uuid(),
  animalId: z.string().optional().default(''),
  produtoId: z.string().uuid(),
  ultimaCompra: z.string().datetime().optional().nullable(),
  previsaoData: z.string().datetime().optional().nullable(),
  diasRecompra: z.number().int().min(1).optional().nullable(),
})

// Chave de um ciclo de recompra (specs/recompra/spec-v2.md).
const CicloSchema = z.object({
  clienteId: z.string().uuid(),
  produtoId: z.string().uuid(),
  animalId: z.string().optional().default(''),
  ultimaCompra: z.string().datetime().transform((v) => new Date(v)),
})

const MotivosSchema = CicloSchema.extend({
  motivos: z.array(z.string()),
  outroTexto: z.string().trim().nullish().transform((v) => v || null),
})

export function registerRecompraRoutes(app: FastifyInstance, prisma: PrismaClient): void {
  const repo = new PrismaRecompraRepository(prisma)
  const listUC = new ListRecompraAlertasUseCase(repo)

  app.get('/api/v1/recompra', async (req, rep) => {
    const q = QuerySchema.safeParse(req.query)
    if (!q.success) throw new ValidationError('VALIDATION_ERROR', q.error.errors[0].message)
    const result = await listUC.execute(q.data)
    rep.send({
      data: result.alertas,
      meta: { page: q.data.page, limit: q.data.limit, total: result.total },
    })
  })

  app.post('/api/v1/recompra/dismiss', async (req, rep) => {
    const body = DismissSchema.safeParse(req.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    const { produtoId, clienteId, animalId, reason } = body.data
    await prisma.recompraDismissal.upsert({
      where: { produtoId_clienteId_animalId: { produtoId, clienteId, animalId } },
      create: { id: crypto.randomUUID(), produtoId, clienteId, animalId, reason },
      update: { reason, createdAt: new Date() },
    })
    rep.status(204).send()
  })

  app.post('/api/v1/recompra/contato', async (req, rep) => {
    const body = CicloSchema.safeParse(req.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    const { email } = req.user as { email: string }
    await repo.marcarMensagemEnviada(body.data, email)
    rep.status(204).send()
  })

  app.delete('/api/v1/recompra/contato', async (req, rep) => {
    const body = CicloSchema.safeParse(req.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    await repo.desmarcarMensagemEnviada(body.data)
    rep.status(204).send()
  })

  app.get('/api/v1/recompra/sumidos', async (_req, rep) => {
    const { alertas } = await repo.findAlertas({ urgencia: 'vencido', page: 1, limit: 10_000 })
    const sumidos = alertas
      .filter((a) => isSumido(a.diasRestantes))
      .map((a) => ({ ...a, diasAtraso: Math.abs(a.diasRestantes) }))
      .sort((a, b) => b.diasAtraso - a.diasAtraso)
    rep.send({ data: sumidos })
  })

  app.put('/api/v1/recompra/sumidos/motivos', async (req, rep) => {
    const body = MotivosSchema.safeParse(req.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    const { motivos, outroTexto, ...ciclo } = body.data
    const erro = validarMotivosSumido(motivos, outroTexto)
    if (erro) throw new ValidationError('VALIDATION_ERROR', erro)

    // O ciclo informado precisa ser o ciclo atual de um cliente sumido.
    const { alertas } = await repo.findAlertas({ clienteId: ciclo.clienteId, urgencia: 'vencido', page: 1, limit: 10_000 })
    const alerta = alertas.find((a) =>
      a.produtoId === ciclo.produtoId &&
      (a.animalId ?? '') === ciclo.animalId &&
      a.ultimaCompra.getTime() === ciclo.ultimaCompra.getTime(),
    )
    if (!alerta || !isSumido(alerta.diasRestantes)) {
      throw new UnprocessableError('NOT_SUMIDO', 'Este cliente não está sumido neste ciclo de recompra')
    }

    const { email } = req.user as { email: string }
    const registro = await repo.registrarMotivosSumido(ciclo, {
      motivos,
      outroTexto: motivos.includes('Outro') ? outroTexto : null,
      registradoPor: email,
    })
    rep.send({ data: registro })
  })

  app.post('/api/v1/recompra/manual', async (req, rep) => {
    const body = ManualSchema.safeParse(req.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    const { clienteId, animalId, produtoId, ultimaCompra, previsaoData, diasRecompra } = body.data
    if (!previsaoData && !diasRecompra) {
      throw new ValidationError('VALIDATION_ERROR', 'Informe a data de previsão ou o número de dias para recompra')
    }
    const result = await repo.createManual({
      clienteId,
      animalId: animalId ?? '',
      produtoId,
      ultimaCompra: ultimaCompra ? new Date(ultimaCompra) : null,
      previsaoData: previsaoData ? new Date(previsaoData) : null,
      diasRecompra: diasRecompra ?? null,
    })
    rep.status(201).send({ data: result })
  })

  app.delete('/api/v1/recompra/manual/:id', async (req, rep) => {
    const { id } = req.params as { id: string }
    await repo.deleteManual(id)
    rep.status(204).send()
  })
}
