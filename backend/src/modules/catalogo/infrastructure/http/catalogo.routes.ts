import type { FastifyInstance } from 'fastify'
import type { PrismaClient } from '@prisma/client'
import { PrismaCatalogoRepository } from '../repositories/prisma-catalogo.repository.js'
import { ListarCatalogoUseCase } from '../../application/use-cases/listar-catalogo.use-case.js'
import { ObterImagemCatalogoUseCase } from '../../application/use-cases/obter-imagem-catalogo.use-case.js'

// Rotas públicas (specs/catalogo/spec-v1.md). A resposta é montada campo a campo no use case:
// nunca reaproveitar o toResponse de produtos, que expõe custo, margens, fornecedor e estoque.
export function registerCatalogoRoutes(app: FastifyInstance, prisma: PrismaClient): void {
  const repo = new PrismaCatalogoRepository(prisma)
  const listarUC = new ListarCatalogoUseCase(repo)
  const imagemUC = new ObterImagemCatalogoUseCase(repo)

  app.get('/api/v1/catalogo/produtos', { config: { public: true } }, async (_req, rep) => {
    rep.header('Cache-Control', 'public, max-age=60').send({ data: await listarUC.execute() })
  })

  app.get('/api/v1/catalogo/produtos/:id/imagem', { config: { public: true } }, async (req, rep) => {
    const { id } = req.params as { id: string }
    const imagem = await imagemUC.execute(id)
    if (imagem.tipo === 'redirecionar') {
      rep.redirect(imagem.url, 302)
      return
    }
    rep
      .header('Content-Type', imagem.contentType)
      .header('Cache-Control', 'public, max-age=31536000, immutable')
      .header('X-Content-Type-Options', 'nosniff')
      .send(imagem.bytes)
  })
}
