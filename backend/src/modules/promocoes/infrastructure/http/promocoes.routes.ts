import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { PrismaPromocaoRepository } from '../repositories/prisma-promocao.repository.js'
import {
  EncerrarPromocaoUseCase,
  ExcluirPromocaoUseCase,
  SalvarPromocaoUseCase,
} from '../../application/use-cases/promocoes.use-cases.js'
import type { PromocaoRegistro } from '../../domain/promocao.repository.interface.js'
import { dataManaus, percentualDesconto, situacaoPromocao } from '../../domain/promocao.js'
import { ValidationError } from '@/shared/errors/validation.error.js'
import { NotFoundError } from '@/shared/errors/not-found.error.js'

const PromocaoSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome da promoção').max(80),
  inicio: z.string().date(),
  fim: z.string().date(),
  itens: z
    .array(z.object({ produtoId: z.string().guid(), valorPromocional: z.number() }))
    .min(1, 'Inclua ao menos um produto na promoção')
    .max(500),
})

export function promocaoParaResposta(p: PromocaoRegistro, agora: Date = new Date()) {
  return {
    id: p.id,
    nome: p.nome,
    inicio: dataManaus(p.inicio),
    fim: dataManaus(p.fim),
    situacao: situacaoPromocao(p, agora),
    itens: p.itens.map((i) => ({
      produtoId: i.produtoId,
      nome: i.produtoNome,
      valorVenda: i.valorVenda,
      valorCusto: i.valorCusto,
      valorPromocional: i.valorPromocional,
      desconto: percentualDesconto(i.valorVenda, i.valorPromocional),
    })),
  }
}

// specs/promocoes/spec-v1.md — rotas internas, com login (auth hook global).
export function registerPromocoesRoutes(app: FastifyInstance, prisma: PrismaClient): void {
  const repo = new PrismaPromocaoRepository(prisma)
  const salvarUC = new SalvarPromocaoUseCase(repo)
  const encerrarUC = new EncerrarPromocaoUseCase(repo)
  const excluirUC = new ExcluirPromocaoUseCase(repo)

  const corpo = (body: unknown) => {
    const r = PromocaoSchema.safeParse(body)
    if (!r.success) throw new ValidationError('VALIDATION_ERROR', r.error.issues[0].message)
    return r.data
  }

  app.get('/api/v1/promocoes', async (_req, rep) => {
    const agora = new Date()
    rep.send({ data: (await repo.listar()).map((p) => promocaoParaResposta(p, agora)) })
  })

  app.get('/api/v1/promocoes/:id', async (req, rep) => {
    const { id } = req.params as { id: string }
    const promocao = await repo.buscar(id)
    if (!promocao) throw new NotFoundError('NOT_FOUND', 'Promoção não encontrada')
    rep.send({ data: promocaoParaResposta(promocao) })
  })

  app.post('/api/v1/promocoes', async (req, rep) => {
    rep.status(201).send({ data: promocaoParaResposta(await salvarUC.execute(corpo(req.body))) })
  })

  app.put('/api/v1/promocoes/:id', async (req, rep) => {
    const { id } = req.params as { id: string }
    rep.send({ data: promocaoParaResposta(await salvarUC.execute(corpo(req.body), id)) })
  })

  app.post('/api/v1/promocoes/:id/encerrar', async (req, rep) => {
    const { id } = req.params as { id: string }
    rep.send({ data: promocaoParaResposta(await encerrarUC.execute(id)) })
  })

  app.delete('/api/v1/promocoes/:id', async (req, rep) => {
    const { id } = req.params as { id: string }
    await excluirUC.execute(id)
    rep.status(204).send()
  })
}
