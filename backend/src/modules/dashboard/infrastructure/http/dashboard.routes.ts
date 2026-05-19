import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { PrismaDashboardRepository } from '../repositories/prisma-dashboard.repository.js'
import { z } from 'zod'
import { ValidationError } from '@/shared/errors/validation.error.js'

const QuerySchema = z.object({
  inicio: z.string().date().default(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().slice(0, 10)
  }),
  fim: z.string().date().default(() => new Date().toISOString().slice(0, 10)),
})

export function registerDashboardRoutes(app: FastifyInstance, prisma: PrismaClient): void {
  const repo = new PrismaDashboardRepository(prisma)

  app.get('/api/v1/dashboard', async (req, rep) => {
    const q = QuerySchema.safeParse(req.query)
    if (!q.success) throw new ValidationError('VALIDATION_ERROR', q.error.errors[0].message)
    const kpis = await repo.getKPIs({
      inicio: new Date(q.data.inicio),
      fim: new Date(q.data.fim + 'T23:59:59.999Z'),
    })
    rep.send({ data: kpis })
  })
}
