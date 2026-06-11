import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { PrismaVendaRepository } from '../repositories/prisma-venda.repository.js'
import { PrismaClienteRepository } from '@/modules/clientes/infrastructure/repositories/prisma-cliente.repository.js'
import { CreateVendaUseCase } from '../../application/use-cases/create-venda.use-case.js'
import { GetVendaUseCase } from '../../application/use-cases/get-venda.use-case.js'
import { ListVendasUseCase } from '../../application/use-cases/list-vendas.use-case.js'
import { DeleteVendaUseCase } from '../../application/use-cases/delete-venda.use-case.js'
import { UpdateVendaUseCase } from '../../application/use-cases/update-venda.use-case.js'
import { CreateVendaSchema, UpdateVendaSchema, ListVendasQuerySchema } from './vendas.schema.js'
import { ValidationError } from '@/shared/errors/validation.error.js'
import type { Venda } from '../../domain/entities/venda.entity.js'

function toResponse(v: Venda, extra?: { clienteNome?: string | null; animalNome?: string | null }) {
  return {
    id: v.id,
    numero: v.numero,
    clienteId: v.clienteId,
    animalId: v.animalId,
    data: v.data,
    formaPag: v.formaPag,
    taxaCartao: v.taxaCartao,
    taxaEntrega: v.taxaEntrega,
    desconto: v.desconto,
    total: v.total,
    obs: v.obs,
    itens: v.itens,
    cliente: extra?.clienteNome ? { nome: extra.clienteNome } : undefined,
    animal: extra?.animalNome ? { nome: extra.animalNome } : undefined,
    createdAt: v.createdAt,
  }
}

export function registerVendasRoutes(app: FastifyInstance, prisma: PrismaClient): void {
  const vendaRepo = new PrismaVendaRepository(prisma)
  const clienteRepo = new PrismaClienteRepository(prisma)
  const createUC = new CreateVendaUseCase(vendaRepo, clienteRepo)
  const getUC = new GetVendaUseCase(vendaRepo)
  const listUC = new ListVendasUseCase(vendaRepo)
  const deleteUC = new DeleteVendaUseCase(vendaRepo)
  const updateUC = new UpdateVendaUseCase(vendaRepo)

  app.get('/api/v1/vendas', async (req, rep) => {
    const q = ListVendasQuerySchema.safeParse(req.query)
    if (!q.success) throw new ValidationError('VALIDATION_ERROR', q.error.errors[0].message)
    const result = await listUC.execute(q.data)

    const ids = result.vendas.map((v) => v.id)
    const rows = await prisma.venda.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        cliente: { select: { nome: true } },
        animal: { select: { nome: true } },
      },
    })
    const extraMap = new Map(rows.map((r) => [r.id, { clienteNome: r.cliente?.nome, animalNome: r.animal?.nome }]))

    rep.send({
      data: result.vendas.map((v) => toResponse(v, extraMap.get(v.id))),
      meta: { page: q.data.page, limit: q.data.limit, total: result.total },
    })
  })

  app.post('/api/v1/vendas', async (req, rep) => {
    const body = CreateVendaSchema.safeParse(req.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    const venda = await createUC.execute(body.data)
    rep.status(201).send({ data: toResponse(venda) })
  })

  app.get('/api/v1/vendas/:id', async (req, rep) => {
    const { id } = req.params as { id: string }
    const venda = await getUC.execute({ id })
    const row = await prisma.venda.findUnique({
      where: { id },
      select: {
        cliente: { select: { nome: true } },
        animal: { select: { nome: true } },
      },
    })
    rep.send({ data: toResponse(venda, { clienteNome: row?.cliente?.nome, animalNome: row?.animal?.nome }) })
  })

  app.patch('/api/v1/vendas/:id', async (req, rep) => {
    const { id } = req.params as { id: string }
    const body = UpdateVendaSchema.safeParse(req.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    const venda = await updateUC.execute({ id, ...body.data })
    const row = await prisma.venda.findUnique({
      where: { id },
      select: { cliente: { select: { nome: true } }, animal: { select: { nome: true } } },
    })
    rep.send({ data: toResponse(venda, { clienteNome: row?.cliente?.nome, animalNome: row?.animal?.nome }) })
  })

  app.delete('/api/v1/vendas/:id', async (req, rep) => {
    const { id } = req.params as { id: string }
    await deleteUC.execute({ id })
    rep.status(204).send()
  })
}
