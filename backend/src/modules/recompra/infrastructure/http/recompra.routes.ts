import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { PrismaRecompraRepository } from '../repositories/prisma-recompra.repository.js'
import { ListRecompraAlertasUseCase } from '../../application/use-cases/list-recompra-alertas.use-case.js'
import { z } from 'zod'
import { ValidationError } from '@/shared/errors/validation.error.js'

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
}
