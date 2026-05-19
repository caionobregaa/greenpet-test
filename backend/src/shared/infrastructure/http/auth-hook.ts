import type { FastifyInstance } from 'fastify'
import { UnauthorizedError } from '../../errors/unauthorized.error.js'

export function registerAuthHook(app: FastifyInstance): void {
  app.addHook('onRequest', async (request, _reply) => {
    const routeConfig = request.routeOptions.config as Record<string, unknown>
    if (routeConfig?.public === true) return

    try {
      await request.jwtVerify()
    } catch {
      throw new UnauthorizedError('UNAUTHORIZED', 'Token inválido ou ausente')
    }
  })
}
