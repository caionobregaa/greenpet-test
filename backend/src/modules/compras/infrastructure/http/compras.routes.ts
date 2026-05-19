import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { PrismaCompraRepository } from '../repositories/prisma-compra.repository.js'
import { CreateCompraUseCase } from '../../application/use-cases/create-compra.use-case.js'
import { GetCompraUseCase } from '../../application/use-cases/get-compra.use-case.js'
import { ListComprasUseCase } from '../../application/use-cases/list-compras.use-case.js'
import { UpdateCompraUseCase } from '../../application/use-cases/update-compra.use-case.js'
import { UpdateCompraStatusUseCase } from '../../application/use-cases/update-compra-status.use-case.js'
import { DeleteCompraUseCase } from '../../application/use-cases/delete-compra.use-case.js'
import {
  CreateCompraSchema,
  UpdateCompraSchema,
  UpdateCompraStatusSchema,
  ListComprasQuerySchema,
} from './compras.schema.js'
import { ValidationError } from '@/shared/errors/validation.error.js'
import type { Compra } from '../../domain/entities/compra.entity.js'

function toResponse(c: Compra) {
  return {
    id: c.id,
    fornecedor: c.fornecedor,
    dataPedido: c.dataPedido,
    dataRecebimento: c.dataRecebimento,
    status: c.status,
    total: c.total,
    obs: c.obs,
    itens: c.itens,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }
}

export function registerComprasRoutes(app: FastifyInstance, prisma: PrismaClient): void {
  const repo = new PrismaCompraRepository(prisma)
  const createUC = new CreateCompraUseCase(repo)
  const getUC = new GetCompraUseCase(repo)
  const listUC = new ListComprasUseCase(repo)
  const updateUC = new UpdateCompraUseCase(repo)
  const statusUC = new UpdateCompraStatusUseCase(repo)
  const deleteUC = new DeleteCompraUseCase(repo)

  app.get('/api/v1/compras', async (req, rep) => {
    const q = ListComprasQuerySchema.safeParse(req.query)
    if (!q.success) throw new ValidationError('VALIDATION_ERROR', q.error.errors[0].message)
    const result = await listUC.execute(q.data)
    rep.send({ data: result.compras.map(toResponse), meta: { page: q.data.page, limit: q.data.limit, total: result.total } })
  })

  app.post('/api/v1/compras', async (req, rep) => {
    const body = CreateCompraSchema.safeParse(req.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    const compra = await createUC.execute(body.data)
    rep.status(201).send({ data: toResponse(compra) })
  })

  app.get('/api/v1/compras/:id', async (req, rep) => {
    const { id } = req.params as { id: string }
    const compra = await getUC.execute({ id })
    rep.send({ data: toResponse(compra) })
  })

  app.put('/api/v1/compras/:id', async (req, rep) => {
    const { id } = req.params as { id: string }
    const body = UpdateCompraSchema.safeParse(req.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    const compra = await updateUC.execute({ id, ...body.data })
    rep.send({ data: toResponse(compra) })
  })

  app.patch('/api/v1/compras/:id/status', async (req, rep) => {
    const { id } = req.params as { id: string }
    const body = UpdateCompraStatusSchema.safeParse(req.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    const compra = await statusUC.execute({ id, acao: body.data.acao })
    rep.send({ data: toResponse(compra) })
  })

  app.delete('/api/v1/compras/:id', async (req, rep) => {
    const { id } = req.params as { id: string }
    await deleteUC.execute({ id })
    rep.status(204).send()
  })
}
