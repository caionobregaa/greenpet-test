import type { FastifyInstance } from 'fastify'
import type { ClientesController } from './clientes.controller.js'

export function registerClientesRoutes(app: FastifyInstance, controller: ClientesController): void {
  app.get('/api/v1/clientes', (req, rep) => controller.list(req, rep))
  app.post('/api/v1/clientes', (req, rep) => controller.create(req, rep))
  app.get('/api/v1/clientes/:id', (req, rep) => controller.getOne(req as never, rep))
  app.put('/api/v1/clientes/:id', (req, rep) => controller.update(req as never, rep))
  app.delete('/api/v1/clientes/:id', (req, rep) => controller.delete(req as never, rep))
}
