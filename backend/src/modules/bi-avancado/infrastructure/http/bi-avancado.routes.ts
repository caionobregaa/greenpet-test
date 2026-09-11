import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { PrismaBiAvancadoRepository } from '../repositories/prisma-bi-avancado.repository.js'
import { GetBiAvancadoUseCase } from '../../application/use-cases/get-bi-avancado.use-case.js'
import { ValidationError } from '@/shared/errors/validation.error.js'

const QuerySchema = z.object({
  inicio: z.string().date().default(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().slice(0, 10)
  }),
  fim: z.string().date().default(() => new Date().toISOString().slice(0, 10)),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export function registerBiAvancadoRoutes(app: FastifyInstance, prisma: PrismaClient): void {
  const repo = new PrismaBiAvancadoRepository(prisma)
  const useCase = new GetBiAvancadoUseCase(repo)

  app.get('/api/v1/bi/avancado', async (req, rep) => {
    const q = QuerySchema.safeParse(req.query)
    if (!q.success) throw new ValidationError('VALIDATION_ERROR', q.error.errors[0].message)
    const resultado = await useCase.execute({
      inicio: new Date(q.data.inicio),
      fim: new Date(q.data.fim + 'T23:59:59.999Z'),
      page: q.data.page,
      limit: q.data.limit,
    })
    rep.send({ data: resultado })
  })
}
