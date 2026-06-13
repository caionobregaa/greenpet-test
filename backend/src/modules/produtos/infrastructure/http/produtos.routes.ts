import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { PrismaProdutoRepository } from '../repositories/prisma-produto.repository.js'
import { CreateProdutoUseCase } from '../../application/use-cases/create-produto.use-case.js'
import { UpdateProdutoUseCase } from '../../application/use-cases/update-produto.use-case.js'
import { DeleteProdutoUseCase } from '../../application/use-cases/delete-produto.use-case.js'
import { GetProdutoUseCase } from '../../application/use-cases/get-produto.use-case.js'
import { ListProdutosUseCase } from '../../application/use-cases/list-produtos.use-case.js'
import {
  CreateProdutoSchema,
  UpdateProdutoSchema,
  ListProdutosQuerySchema,
} from './produtos.schema.js'
import { ValidationError } from '@/shared/errors/validation.error.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'
import type { Produto } from '../../domain/entities/produto.entity.js'

function toResponse(p: Produto, estoque = 0) {
  return {
    id: p.id,
    nome: p.nome,
    categoria: p.categoria,
    especie: p.especie,
    subCategoria: p.subCategoria,
    marca: p.marca,
    fornecedor: p.fornecedor,
    pesoEmbalagem: p.pesoEmbalagem,
    unidadeEmbalagem: p.unidadeEmbalagem ?? null,
    valorCusto: p.valorCusto,
    valorVenda: p.valorVenda,
    margemCalculada: p.margemCalculada,
    margemCartao: p.margemCartao,
    margemImposto: p.margemImposto,
    margemOperacao: p.margemOperacao,
    margemLucro: p.margemLucro,
    diasRecompra: p.diasRecompra,
    descricao: p.descricao,
    imagemUrl: p.imagemUrl ?? null,
    estoque,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }
}

export function registerProdutosRoutes(app: FastifyInstance, prisma: PrismaClient): void {
  const repo = new PrismaProdutoRepository(prisma)
  const createUC = new CreateProdutoUseCase(repo)
  const updateUC = new UpdateProdutoUseCase(repo)
  const deleteUC = new DeleteProdutoUseCase(repo)
  const getUC = new GetProdutoUseCase(repo)
  const listUC = new ListProdutosUseCase(repo)

  app.get('/api/v1/produtos', async (req, rep) => {
    const q = ListProdutosQuerySchema.safeParse(req.query)
    if (!q.success) throw new ValidationError('VALIDATION_ERROR', q.error.errors[0].message)
    const result = await listUC.execute(q.data)
    const ids = result.produtos.map((p) => p.id)
    const estoqueGroups = ids.length > 0
      ? await prisma.estoqueItem.groupBy({
          by: ['produtoId'],
          where: { produtoId: { in: ids } },
          _sum: { quantidade: true },
        })
      : []
    const estoqueMap = new Map(estoqueGroups.map((g) => [g.produtoId, g._sum.quantidade ?? 0]))
    rep.send({
      data: result.produtos.map((p) => toResponse(p, estoqueMap.get(p.id) ?? 0)),
      meta: { page: q.data.page, limit: q.data.limit, total: result.total },
    })
  })

  app.post('/api/v1/produtos', async (req, rep) => {
    const body = CreateProdutoSchema.safeParse(req.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    const produto = await createUC.execute(body.data)
    rep.status(201).send({ data: toResponse(produto) })
  })

  app.get('/api/v1/produtos/:id', async (req, rep) => {
    const { id } = req.params as { id: string }
    const produto = await getUC.execute({ id })
    rep.send({ data: toResponse(produto) })
  })

  app.put('/api/v1/produtos/:id', async (req, rep) => {
    const { id } = req.params as { id: string }
    const body = UpdateProdutoSchema.safeParse(req.body)
    if (!body.success) throw new ValidationError('VALIDATION_ERROR', body.error.errors[0].message)
    const produto = await updateUC.execute({ id, ...body.data })
    rep.send({ data: toResponse(produto) })
  })

  app.delete('/api/v1/produtos/:id', async (req, rep) => {
    const { id } = req.params as { id: string }
    await deleteUC.execute({ id })
    rep.status(204).send()
  })
}
