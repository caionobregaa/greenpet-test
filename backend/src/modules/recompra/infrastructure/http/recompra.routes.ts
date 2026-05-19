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
}
