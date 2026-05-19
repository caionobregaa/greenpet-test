import type { FastifyInstance } from 'fastify'
import type { AuthController } from './auth.controller.js'

export function registerAuthRoutes(app: FastifyInstance, controller: AuthController): void {
  app.post('/api/v1/auth/login', { config: { public: true } }, (req, rep) =>
    controller.login(req, rep),
  )
  app.post('/api/v1/auth/refresh', { config: { public: true } }, (req, rep) =>
    controller.refresh(req, rep),
  )
  app.post('/api/v1/auth/logout', (req, rep) => controller.logout(req, rep))
}
