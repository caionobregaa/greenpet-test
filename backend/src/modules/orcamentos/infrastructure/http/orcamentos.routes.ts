import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { PrismaOrcamentoRepository } from '../repositories/prisma-orcamento.repository.js'
import { PrismaVendaRepository } from '@/modules/vendas/infrastructure/repositories/prisma-venda.repository.js'
import { PrismaClienteRepository } from '@/modules/clientes/infrastructure/repositories/prisma-cliente.repository.js'
import { CreateOrcamentoUseCase } from '../../application/use-cases/create-orcamento.use-case.js'
import { GetOrcamentoUseCase } from '../../application/use-cases/get-orcamento.use-case.js'
import { ListOrcamentosUseCase } from '../../application/use-cases/list-orcamentos.use-case.js'
import { UpdateOrcamentoStatusUseCase } from '../../application/use-cases/update-orcamento-status.use-case.js'
import { ConverterOrcamentoUseCase } from '../../application/use-cases/converter-orcamento.use-case.js'
import { DeleteOrcamentoUseCase } from '../../application/use-cases/delete-orcamento.use-case.js'
import { UpdateOrcamentoUseCase } from '../../application/use-cases/update-orcamento.use-case.js'
import {
  CreateOrcamentoSchema,
  UpdateOrcamentoSchema,
  UpdateOrcamentoStatusSchema,
  ConverterOrcamentoSchema,
  ListOrcamentosQuerySchema,
} from './orcamentos.schema.js'
import { ValidationError } from '@/shared/errors/validation.error.js'
import type { Orcamento } from '../../domain/entities/orcamento.entity.js'

function toResponse(o: Orcamento, extra?: { clienteNome?: string | null; animalNome?: string | null }) {
  return {
    id: o.id,
    numero: o.numero,
    clienteId: o.clienteId,
    animalId: o.animalId,
    data: o.data,
    validade: o.validade,
    status: o.status,
    vencido: o.vencido,
    total: o.total,
    obs: o.obs,
    vendaId: o.vendaId,
    formasPag: o.formasPag,
    itens: o.itens,
    cliente: extra?.clienteNome ? { nome: extra.clienteNome } : undefined,
    animal: extra?.animalNome ? { nome: extra.animalNome } : undefined,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  }
}

export function registerOrcamentosRoutes(app: FastifyInstance, prisma: PrismaClient): void {
  const orcamentoRepo = new PrismaOrcamentoRepository(prisma)
  const vendaRepo = new PrismaVendaRepository(prisma)
  const clienteRepo = new PrismaClienteRepository(prisma)

  const createUC = new CreateOrcamentoUseCase(orcamentoRepo, clienteRepo)
  const getUC = new GetOrcamentoUseCase(orcamentoRepo)
  const listUC = new ListOrcamentosUseCase(orcamentoRepo)
  const statusUC = new UpdateOrcamentoStatusUseCase(orcamentoRepo)
  const converterUC = new ConverterOrcamentoUseCase(orcamentoRepo, vendaRepo)
  const deleteUC = new DeleteOrcamentoUseCase(orcamentoRepo)
  const updateUC = new UpdateOrcamentoUseCase(orcamentoRepo)

  app.get('/api/v1/orcamentos', async (req, rep) => {
    const q = ListOrcamentosQuerySchema.safeParse(req.query)
    if (!q.success) throw new ValidationError('VALIDATION_ERROR', q.error.errors[0].message)
    const result = await listUC.execute(q.data)

    // Fetch cliente/animal data in one batch query
    const ids = result.orcamentos.map((o) => o.id)
    const rows = await prisma.orcamento.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        cliente: { select: { nome: true } },
        animal: { select: { nome: true } },
      },
    })
    const extraMap = new Map(rows.map((r) => [r.id, { clienteNome: r.cliente?.nome, animalNome: r.animal?.nome }]))

    rep.send({
      data: result.orcamentos.map((o) => toResponse(o, extraMap.get(o.id))),
      meta: { page: q.data.page, limit: q.data.limit, total: result.total },
    })
  })

  app.post('/api/v1/orcamentos', async (req, rep) => {
    const body = CreateOrcamentoSchema.safeParse(req.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    const o = await createUC.execute(body.data)
    rep.status(201).send({ data: toResponse(o) })
  })

  app.get('/api/v1/orcamentos/:id', async (req, rep) => {
    const { id } = req.params as { id: string }
    const o = await getUC.execute({ id })
    const row = await prisma.orcamento.findUnique({
      where: { id },
      select: {
        cliente: { select: { nome: true } },
        animal: { select: { nome: true } },
      },
    })
    rep.send({ data: toResponse(o, { clienteNome: row?.cliente?.nome, animalNome: row?.animal?.nome }) })
  })

  app.patch('/api/v1/orcamentos/:id/status', async (req, rep) => {
    const { id } = req.params as { id: string }
    const body = UpdateOrcamentoStatusSchema.safeParse(req.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    const o = await statusUC.execute({ id, acao: body.data.acao })
    rep.send({ data: toResponse(o) })
  })

  app.post('/api/v1/orcamentos/:id/converter', async (req, rep) => {
    const { id } = req.params as { id: string }
    const body = ConverterOrcamentoSchema.safeParse(req.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    const venda = await converterUC.execute({ id, formaPag: body.data.formaPag, taxaCartao: body.data.taxaCartao, taxaEntrega: body.data.taxaEntrega, desconto: body.data.desconto })
    rep.status(201).send({ data: { vendaId: venda.id } })
  })

  app.put('/api/v1/orcamentos/:id', async (req, rep) => {
    const { id } = req.params as { id: string }
    const body = UpdateOrcamentoSchema.safeParse(req.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    const o = await updateUC.execute({ id, ...body.data })
    rep.send({ data: toResponse(o) })
  })

  app.delete('/api/v1/orcamentos/:id', async (req, rep) => {
    const { id } = req.params as { id: string }
    await deleteUC.execute({ id })
    rep.status(204).send()
  })
}
