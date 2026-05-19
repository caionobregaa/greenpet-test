import { env } from './shared/infrastructure/env/env.js'
import { buildApp } from './shared/infrastructure/http/fastify-app.js'
import { prisma } from './shared/infrastructure/database/prisma.client.js'

// Auth
import { PrismaUserRepository } from './modules/auth/infrastructure/repositories/prisma-user.repository.js'
import { PrismaRefreshTokenRepository } from './modules/auth/infrastructure/repositories/prisma-refresh-token.repository.js'
import { JwtService } from './modules/auth/infrastructure/services/jwt.service.js'
import { LoginUseCase } from './modules/auth/application/use-cases/login.use-case.js'
import { RefreshTokenUseCase } from './modules/auth/application/use-cases/refresh-token.use-case.js'
import { LogoutUseCase } from './modules/auth/application/use-cases/logout.use-case.js'
import { AuthController } from './modules/auth/infrastructure/http/auth.controller.js'
import { registerAuthRoutes } from './modules/auth/infrastructure/http/auth.routes.js'

// Clientes
import { PrismaClienteRepository } from './modules/clientes/infrastructure/repositories/prisma-cliente.repository.js'
import { CreateClienteUseCase } from './modules/clientes/application/use-cases/create-cliente.use-case.js'
import { UpdateClienteUseCase } from './modules/clientes/application/use-cases/update-cliente.use-case.js'
import { DeleteClienteUseCase } from './modules/clientes/application/use-cases/delete-cliente.use-case.js'
import { GetClienteUseCase } from './modules/clientes/application/use-cases/get-cliente.use-case.js'
import { ListClientesUseCase } from './modules/clientes/application/use-cases/list-clientes.use-case.js'
import { ClientesController } from './modules/clientes/infrastructure/http/clientes.controller.js'
import { registerClientesRoutes } from './modules/clientes/infrastructure/http/clientes.routes.js'

// Animais
import { PrismaAnimalRepository } from './modules/animais/infrastructure/repositories/prisma-animal.repository.js'
import { CreateAnimalUseCase } from './modules/animais/application/use-cases/create-animal.use-case.js'
import { UpdateAnimalUseCase } from './modules/animais/application/use-cases/update-animal.use-case.js'
import { DeleteAnimalUseCase } from './modules/animais/application/use-cases/delete-animal.use-case.js'
import { GetAnimalUseCase } from './modules/animais/application/use-cases/get-animal.use-case.js'
import { ListAnimaisUseCase } from './modules/animais/application/use-cases/list-animais.use-case.js'
import { AnimaisController } from './modules/animais/infrastructure/http/animais.controller.js'
import { registerAnimaisRoutes } from './modules/animais/infrastructure/http/animais.routes.js'

// Produtos, Vendas, Orcamentos, Compras, Recompra, Dashboard (use route factories)
import { registerProdutosRoutes } from './modules/produtos/infrastructure/http/produtos.routes.js'
import { registerVendasRoutes } from './modules/vendas/infrastructure/http/vendas.routes.js'
import { registerOrcamentosRoutes } from './modules/orcamentos/infrastructure/http/orcamentos.routes.js'
import { registerComprasRoutes } from './modules/compras/infrastructure/http/compras.routes.js'
import { registerRecompraRoutes } from './modules/recompra/infrastructure/http/recompra.routes.js'
import { registerDashboardRoutes } from './modules/dashboard/infrastructure/http/dashboard.routes.js'

async function bootstrap(): Promise<void> {
  const app = await buildApp({ jwtSecret: env.JWT_SECRET, logger: env.NODE_ENV !== 'test' })

  // Auth
  const userRepo = new PrismaUserRepository(prisma)
  const refreshRepo = new PrismaRefreshTokenRepository(prisma)
  const jwtService = new JwtService(env.JWT_SECRET)
  const loginUC = new LoginUseCase(userRepo, refreshRepo, jwtService, env.JWT_EXPIRES_IN, env.REFRESH_TOKEN_EXPIRES_IN)
  const refreshUC = new RefreshTokenUseCase(userRepo, refreshRepo, jwtService, env.JWT_EXPIRES_IN, env.REFRESH_TOKEN_EXPIRES_IN)
  const logoutUC = new LogoutUseCase(refreshRepo)
  const authCtrl = new AuthController(loginUC, refreshUC, logoutUC)
  registerAuthRoutes(app, authCtrl)

  // Clientes
  const clienteRepo = new PrismaClienteRepository(prisma)
  const clientesCtrl = new ClientesController(
    new CreateClienteUseCase(clienteRepo),
    new UpdateClienteUseCase(clienteRepo),
    new DeleteClienteUseCase(clienteRepo),
    new GetClienteUseCase(clienteRepo),
    new ListClientesUseCase(clienteRepo),
  )
  registerClientesRoutes(app, clientesCtrl)

  // Animais
  const animalRepo = new PrismaAnimalRepository(prisma)
  const animaisCtrl = new AnimaisController(
    new CreateAnimalUseCase(animalRepo, clienteRepo),
    new UpdateAnimalUseCase(animalRepo),
    new DeleteAnimalUseCase(animalRepo),
    new GetAnimalUseCase(animalRepo),
    new ListAnimaisUseCase(animalRepo),
  )
  registerAnimaisRoutes(app, animaisCtrl)

  // Route factory modules
  registerProdutosRoutes(app, prisma)
  registerVendasRoutes(app, prisma)
  registerOrcamentosRoutes(app, prisma)
  registerComprasRoutes(app, prisma)
  registerRecompraRoutes(app, prisma)
  registerDashboardRoutes(app, prisma)

  await app.listen({ port: env.PORT, host: env.HOST })
  console.log(`🚀 GreenPET API rodando em http://${env.HOST}:${env.PORT}`)
}

bootstrap().catch((err) => {
  console.error(err)
  process.exit(1)
})
