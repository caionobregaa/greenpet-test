import type { FastifyInstance } from 'fastify'
import type { AnimaisController } from './animais.controller.js'

export function registerAnimaisRoutes(app: FastifyInstance, controller: AnimaisController): void {
  app.get('/api/v1/animais', (req, rep) => controller.list(req, rep))
  app.post('/api/v1/animais', (req, rep) => controller.create(req, rep))
  app.get('/api/v1/animais/:id', (req, rep) => controller.getOne(req as never, rep))
  app.put('/api/v1/animais/:id', (req, rep) => controller.update(req as never, rep))
  app.delete('/api/v1/animais/:id', (req, rep) => controller.delete(req as never, rep))
}
