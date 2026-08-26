import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { PrismaCurvaVendaRepository } from '../repositories/prisma-curva-venda.repository.js'
import { GetCurvaVendaUseCase } from '../../application/use-cases/get-curva-venda.use-case.js'
import { ValidationError } from '@/shared/errors/validation.error.js'

const QuerySchema = z.object({
  dataInicio: z.string().datetime().optional(),
  dataFim: z.string().datetime().optional(),
  categoria: z.string().optional(),
  sortBy: z.enum(['categoria', 'quantidadeVendida', 'receitaTotal', 'percentualReceita', 'percentualAcumulado']).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
})

export function registerCurvaVendaRoutes(app: FastifyInstance, prisma: PrismaClient): void {
  const repo = new PrismaCurvaVendaRepository(prisma)
  const getUC = new GetCurvaVendaUseCase(repo)

  app.get('/api/v1/curva-venda', async (req, rep) => {
    const q = QuerySchema.safeParse(req.query)
    if (!q.success) throw new ValidationError('VALIDATION_ERROR', q.error.errors[0].message)

    const result = await getUC.execute({
      dataInicio: q.data.dataInicio ? new Date(q.data.dataInicio) : undefined,
      dataFim: q.data.dataFim ? new Date(q.data.dataFim) : undefined,
      categoria: q.data.categoria,
      sortBy: q.data.sortBy,
      sortOrder: q.data.sortOrder,
      page: q.data.page,
      limit: q.data.limit,
    })

    rep.send({
      data: result.produtos,
      meta: { page: q.data.page, limit: q.data.limit, total: result.total, resumo: result.resumo },
    })
  })
}
