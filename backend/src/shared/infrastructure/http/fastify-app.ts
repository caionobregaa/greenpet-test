import Fastify, { type FastifyInstance } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import { errorHandler } from './error-handler.js'
import { registerAuthHook } from './auth-hook.js'

export interface AppOptions {
  jwtSecret: string
  logger?: boolean
}

export async function buildApp(opts: AppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: opts.logger ?? false })

  await app.register(fastifyJwt, { secret: opts.jwtSecret })

  registerAuthHook(app)
  app.setErrorHandler(errorHandler)

  return app
}
