import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { ValidationError } from '@/shared/errors/validation.error.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

const CreateSchema = z.object({
  texto: z.string().min(1).max(500),
})

export function registerLembretesRoutes(app: FastifyInstance, prisma: PrismaClient): void {
  app.get('/api/v1/lembretes', async (req, rep) => {
    const rows = await prisma.lembrete.findMany({
      orderBy: { criadoEm: 'desc' },
    })
    rep.send({ data: rows })
  })

  app.post('/api/v1/lembretes', async (req, rep) => {
    const body = CreateSchema.safeParse(req.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)

    const { email } = req.user as { email: string }

    const lembrete = await prisma.lembrete.create({
      data: {
        id: crypto.randomUUID(),
        texto: body.data.texto,
        criadoPor: email,
      },
    })
    rep.status(201).send({ data: lembrete })
  })

  app.delete('/api/v1/lembretes/:id', async (req, rep) => {
    const { id } = req.params as { id: string }
    const existing = await prisma.lembrete.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('NOT_FOUND', 'Lembrete não encontrado')
    await prisma.lembrete.delete({ where: { id } })
    rep.status(204).send()
  })
}
