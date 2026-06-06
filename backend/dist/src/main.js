"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_js_1 = require("./shared/infrastructure/env/env.js");
const fastify_app_js_1 = require("./shared/infrastructure/http/fastify-app.js");
const prisma_client_js_1 = require("./shared/infrastructure/database/prisma.client.js");
// Auth
const prisma_user_repository_js_1 = require("./modules/auth/infrastructure/repositories/prisma-user.repository.js");
const prisma_refresh_token_repository_js_1 = require("./modules/auth/infrastructure/repositories/prisma-refresh-token.repository.js");
const jwt_service_js_1 = require("./modules/auth/infrastructure/services/jwt.service.js");
const login_use_case_js_1 = require("./modules/auth/application/use-cases/login.use-case.js");
const refresh_token_use_case_js_1 = require("./modules/auth/application/use-cases/refresh-token.use-case.js");
const logout_use_case_js_1 = require("./modules/auth/application/use-cases/logout.use-case.js");
const auth_controller_js_1 = require("./modules/auth/infrastructure/http/auth.controller.js");
const auth_routes_js_1 = require("./modules/auth/infrastructure/http/auth.routes.js");
// Clientes
const prisma_cliente_repository_js_1 = require("./modules/clientes/infrastructure/repositories/prisma-cliente.repository.js");
const create_cliente_use_case_js_1 = require("./modules/clientes/application/use-cases/create-cliente.use-case.js");
const update_cliente_use_case_js_1 = require("./modules/clientes/application/use-cases/update-cliente.use-case.js");
const delete_cliente_use_case_js_1 = require("./modules/clientes/application/use-cases/delete-cliente.use-case.js");
const get_cliente_detail_use_case_js_1 = require("./modules/clientes/application/use-cases/get-cliente-detail.use-case.js");
const list_clientes_use_case_js_1 = require("./modules/clientes/application/use-cases/list-clientes.use-case.js");
const clientes_controller_js_1 = require("./modules/clientes/infrastructure/http/clientes.controller.js");
const clientes_routes_js_1 = require("./modules/clientes/infrastructure/http/clientes.routes.js");
// Animais + Vendas (repos needed for GetClienteDetailUseCase)
const prisma_animal_repository_js_1 = require("./modules/animais/infrastructure/repositories/prisma-animal.repository.js");
const prisma_venda_repository_js_1 = require("./modules/vendas/infrastructure/repositories/prisma-venda.repository.js");
const create_animal_use_case_js_1 = require("./modules/animais/application/use-cases/create-animal.use-case.js");
const update_animal_use_case_js_1 = require("./modules/animais/application/use-cases/update-animal.use-case.js");
const delete_animal_use_case_js_1 = require("./modules/animais/application/use-cases/delete-animal.use-case.js");
const get_animal_use_case_js_1 = require("./modules/animais/application/use-cases/get-animal.use-case.js");
const list_animais_use_case_js_1 = require("./modules/animais/application/use-cases/list-animais.use-case.js");
const animais_controller_js_1 = require("./modules/animais/infrastructure/http/animais.controller.js");
const animais_routes_js_1 = require("./modules/animais/infrastructure/http/animais.routes.js");
// Produtos, Vendas, Orcamentos, Compras, Estoque, Recompra, Dashboard (use route factories)
const produtos_routes_js_1 = require("./modules/produtos/infrastructure/http/produtos.routes.js");
const vendas_routes_js_1 = require("./modules/vendas/infrastructure/http/vendas.routes.js");
const orcamentos_routes_js_1 = require("./modules/orcamentos/infrastructure/http/orcamentos.routes.js");
const compras_routes_js_1 = require("./modules/compras/infrastructure/http/compras.routes.js");
const estoque_routes_js_1 = require("./modules/estoque/infrastructure/http/estoque.routes.js");
const recompra_routes_js_1 = require("./modules/recompra/infrastructure/http/recompra.routes.js");
const dashboard_routes_js_1 = require("./modules/dashboard/infrastructure/http/dashboard.routes.js");
async function bootstrap() {
    const app = await (0, fastify_app_js_1.buildApp)({ jwtSecret: env_js_1.env.JWT_SECRET, logger: env_js_1.env.NODE_ENV !== 'test' });
    // Auth
    const userRepo = new prisma_user_repository_js_1.PrismaUserRepository(prisma_client_js_1.prisma);
    const refreshRepo = new prisma_refresh_token_repository_js_1.PrismaRefreshTokenRepository(prisma_client_js_1.prisma);
    const jwtService = new jwt_service_js_1.JwtService(env_js_1.env.JWT_SECRET);
    const loginUC = new login_use_case_js_1.LoginUseCase(userRepo, refreshRepo, jwtService, env_js_1.env.JWT_EXPIRES_IN, env_js_1.env.REFRESH_TOKEN_EXPIRES_IN);
    const refreshUC = new refresh_token_use_case_js_1.RefreshTokenUseCase(userRepo, refreshRepo, jwtService, env_js_1.env.JWT_EXPIRES_IN, env_js_1.env.REFRESH_TOKEN_EXPIRES_IN);
    const logoutUC = new logout_use_case_js_1.LogoutUseCase(refreshRepo);
    const authCtrl = new auth_controller_js_1.AuthController(loginUC, refreshUC, logoutUC);
    (0, auth_routes_js_1.registerAuthRoutes)(app, authCtrl);
    // Clientes
    const clienteRepo = new prisma_cliente_repository_js_1.PrismaClienteRepository(prisma_client_js_1.prisma);
    const animalRepo = new prisma_animal_repository_js_1.PrismaAnimalRepository(prisma_client_js_1.prisma);
    const vendaRepo = new prisma_venda_repository_js_1.PrismaVendaRepository(prisma_client_js_1.prisma);
    const clientesCtrl = new clientes_controller_js_1.ClientesController(new create_cliente_use_case_js_1.CreateClienteUseCase(clienteRepo), new update_cliente_use_case_js_1.UpdateClienteUseCase(clienteRepo), new delete_cliente_use_case_js_1.DeleteClienteUseCase(clienteRepo), new get_cliente_detail_use_case_js_1.GetClienteDetailUseCase(clienteRepo, animalRepo, vendaRepo), new list_clientes_use_case_js_1.ListClientesUseCase(clienteRepo));
    (0, clientes_routes_js_1.registerClientesRoutes)(app, clientesCtrl);
    // Animais
    const animaisCtrl = new animais_controller_js_1.AnimaisController(new create_animal_use_case_js_1.CreateAnimalUseCase(animalRepo, clienteRepo), new update_animal_use_case_js_1.UpdateAnimalUseCase(animalRepo), new delete_animal_use_case_js_1.DeleteAnimalUseCase(animalRepo), new get_animal_use_case_js_1.GetAnimalUseCase(animalRepo), new list_animais_use_case_js_1.ListAnimaisUseCase(animalRepo));
    (0, animais_routes_js_1.registerAnimaisRoutes)(app, animaisCtrl);
    // Route factory modules
    (0, produtos_routes_js_1.registerProdutosRoutes)(app, prisma_client_js_1.prisma);
    (0, vendas_routes_js_1.registerVendasRoutes)(app, prisma_client_js_1.prisma);
    (0, orcamentos_routes_js_1.registerOrcamentosRoutes)(app, prisma_client_js_1.prisma);
    (0, compras_routes_js_1.registerComprasRoutes)(app, prisma_client_js_1.prisma);
    (0, estoque_routes_js_1.registerEstoqueRoutes)(app, prisma_client_js_1.prisma);
    (0, recompra_routes_js_1.registerRecompraRoutes)(app, prisma_client_js_1.prisma);
    (0, dashboard_routes_js_1.registerDashboardRoutes)(app, prisma_client_js_1.prisma);
    await app.listen({ port: env_js_1.env.PORT, host: env_js_1.env.HOST });
    console.log(`🚀 GreenPET API rodando em http://${env_js_1.env.HOST}:${env_js_1.env.PORT}`);
}
bootstrap().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map