"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const login_use_case_1 = require("../../../../src/modules/auth/application/use-cases/login.use-case");
const in_memory_user_repository_1 = require("./fakes/in-memory-user.repository");
const in_memory_refresh_token_repository_1 = require("./fakes/in-memory-refresh-token.repository");
const user_entity_1 = require("../../../../src/modules/auth/domain/entities/user.entity");
const password_vo_1 = require("../../../../src/modules/auth/domain/value-objects/password.vo");
const fakeJwt = {
    sign: (_payload, _exp) => 'fake.jwt.token',
};
(0, vitest_1.describe)('LoginUseCase', () => {
    let userRepo;
    let refreshRepo;
    let useCase;
    (0, vitest_1.beforeEach)(async () => {
        userRepo = new in_memory_user_repository_1.InMemoryUserRepository();
        refreshRepo = new in_memory_refresh_token_repository_1.InMemoryRefreshTokenRepository();
        useCase = new login_use_case_1.LoginUseCase(userRepo, refreshRepo, fakeJwt, 28800, 30);
        const hash = await password_vo_1.Password.hash('senha123');
        const user = user_entity_1.User.create({ nome: 'Admin', email: 'admin@greenpet.com', senhaHash: hash });
        await userRepo.save(user);
    });
    (0, vitest_1.it)('retorna token e refreshToken com credenciais válidas', async () => {
        const result = await useCase.execute({
            email: 'admin@greenpet.com',
            password: 'senha123',
        });
        (0, vitest_1.expect)(result.token).toBeTruthy();
        (0, vitest_1.expect)(result.refreshToken).toBeTruthy();
        (0, vitest_1.expect)(result.expiresIn).toBe(28800);
        (0, vitest_1.expect)(result.user.email).toBe('admin@greenpet.com');
    });
    (0, vitest_1.it)('reseta tentativas de login após sucesso', async () => {
        const user = await userRepo.findByEmail('admin@greenpet.com');
        user.recordFailedLogin();
        await userRepo.save(user);
        await useCase.execute({ email: 'admin@greenpet.com', password: 'senha123' });
        const updated = await userRepo.findByEmail('admin@greenpet.com');
        (0, vitest_1.expect)(updated.loginAttempts).toBe(0);
    });
    (0, vitest_1.it)('lança INVALID_CREDENTIALS para senha errada', async () => {
        await (0, vitest_1.expect)(useCase.execute({ email: 'admin@greenpet.com', password: 'errada99' })).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    });
    (0, vitest_1.it)('lança INVALID_CREDENTIALS para e-mail inexistente (sem enumerar usuários)', async () => {
        await (0, vitest_1.expect)(useCase.execute({ email: 'ninguem@greenpet.com', password: 'senha123' })).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    });
    (0, vitest_1.it)('lança ACCOUNT_LOCKED quando conta está bloqueada', async () => {
        const user = await userRepo.findByEmail('admin@greenpet.com');
        for (let i = 0; i < 5; i++)
            user.recordFailedLogin();
        await userRepo.save(user);
        await (0, vitest_1.expect)(useCase.execute({ email: 'admin@greenpet.com', password: 'senha123' })).rejects.toMatchObject({ code: 'ACCOUNT_LOCKED' });
    });
    (0, vitest_1.it)('incrementa loginAttempts a cada senha errada', async () => {
        await useCase.execute({ email: 'admin@greenpet.com', password: 'errada99' }).catch(() => { });
        await useCase.execute({ email: 'admin@greenpet.com', password: 'errada99' }).catch(() => { });
        const user = await userRepo.findByEmail('admin@greenpet.com');
        (0, vitest_1.expect)(user.loginAttempts).toBe(2);
    });
});
//# sourceMappingURL=login.use-case.spec.js.map