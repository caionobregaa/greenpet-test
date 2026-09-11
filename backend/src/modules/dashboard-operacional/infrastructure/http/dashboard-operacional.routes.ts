import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { PrismaDashboardOperacionalRepository } from '../repositories/prisma-dashboard-operacional.repository.js'
import { GetDashboardOperacionalUseCase } from '../../application/use-cases/get-dashboard-operacional.use-case.js'
import { PrismaRecompraRepository } from '@/modules/recompra/infrastructure/repositories/prisma-recompra.repository.js'
import { PrismaDashboardRepository } from '@/modules/dashboard/infrastructure/repositories/prisma-dashboard.repository.js'
import { GetDashboardOverviewUseCase } from '@/modules/dashboard/application/use-cases/get-dashboard-overview.use-case.js'
import { PrismaCurvaVendaRepository } from '@/modules/curva-venda/infrastructure/repositories/prisma-curva-venda.repository.js'
import { GetCurvaVendaUseCase } from '@/modules/curva-venda/application/use-cases/get-curva-venda.use-case.js'
import { ValidationError } from '@/shared/errors/validation.error.js'

const QuerySchema = z.object({
  inicio: z.string().date().default(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().slice(0, 10)
  }),
  fim: z.string().date().default(() => new Date().toISOString().slice(0, 10)),
})

export function registerDashboardOperacionalRoutes(app: FastifyInstance, prisma: PrismaClient): void {
  const recompraRepo = new PrismaRecompraRepository(prisma)
  const dashboardOverviewUseCase = new GetDashboardOverviewUseCase(
    new PrismaDashboardRepository(prisma),
    new GetCurvaVendaUseCase(new PrismaCurvaVendaRepository(prisma)),
  )
  const operacionalRepo = new PrismaDashboardOperacionalRepository(prisma)
  const useCase = new GetDashboardOperacionalUseCase(recompraRepo, dashboardOverviewUseCase, operacionalRepo)

  app.get('/api/v1/dashboard-operacional', async (req, rep) => {
    const q = QuerySchema.safeParse(req.query)
    if (!q.success) throw new ValidationError('VALIDATION_ERROR', q.error.errors[0].message)
    const resultado = await useCase.execute({
      inicio: new Date(q.data.inicio),
      fim: new Date(q.data.fim + 'T23:59:59.999Z'),
    })
    rep.send({ data: resultado })
  })
}
