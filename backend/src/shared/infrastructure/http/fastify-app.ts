import Fastify, { type FastifyInstance } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fastifyCors from '@fastify/cors'
import { errorHandler } from './error-handler.js'
import { registerAuthHook } from './auth-hook.js'

export interface AppOptions {
  jwtSecret: string
  logger?: boolean
}

export async function buildApp(opts: AppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: opts.logger ?? false })

  await app.register(fastifyCors, { origin: true, credentials: true })
  await app.register(fastifyJwt, { secret: opts.jwtSecret })

  app.get('/', { config: { public: true } }, async (_req, reply) => {
    reply.type('text/html').send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GreenPET API</title>
  <style>
    body { font-family: sans-serif; max-width: 600px; margin: 60px auto; padding: 0 20px; color: #333; }
    h1 { color: #2d7a2d; }
    .badge { display: inline-block; background: #e6f4e6; color: #2d7a2d; border-radius: 4px; padding: 2px 10px; font-size: 14px; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 14px; }
    ul { line-height: 2; }
    .hint { color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <h1>🐾 GreenPET API</h1>
  <p><span class="badge">online</span> &nbsp; Versão 1.0.0</p>
  <p>A API está funcionando. Use um cliente REST (Postman, Insomnia) para interagir.</p>
  <h3>Autenticação</h3>
  <p>Faça login em <code>POST /api/v1/auth/login</code> com:</p>
  <pre>{ "email": "admin@greenpet.com", "password": "admin123" }</pre>
  <h3>Rotas disponíveis</h3>
  <ul>
    <li><code>POST /api/v1/auth/login</code></li>
    <li><code>GET  /api/v1/clientes</code></li>
    <li><code>GET  /api/v1/animais</code></li>
    <li><code>GET  /api/v1/produtos</code></li>
    <li><code>GET  /api/v1/vendas</code></li>
    <li><code>GET  /api/v1/orcamentos</code></li>
    <li><code>GET  /api/v1/compras</code></li>
    <li><code>GET  /api/v1/recompra/alertas</code></li>
    <li><code>GET  /api/v1/dashboard/kpis</code></li>
  </ul>
  <p class="hint">Todas as rotas (exceto login) exigem o header: <code>Authorization: Bearer &lt;token&gt;</code></p>
  <p><a href="/health">Status da API</a></p>
</body>
</html>`)
  })

  app.get('/health', { config: { public: true } }, async (_req, reply) => {
    reply.send({ status: 'ok', app: 'GreenPET API', version: '1.0.0' })
  })

  registerAuthHook(app)
  app.setErrorHandler(errorHandler)

  return app
}
