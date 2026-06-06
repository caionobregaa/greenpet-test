"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const user_entity_1 = require("../../../../src/modules/auth/domain/entities/user.entity");
(0, vitest_1.describe)('User entity', () => {
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('cria usuário com dados válidos', () => {
            const user = user_entity_1.User.create({ nome: 'Admin', email: 'admin@greenpet.com', senhaHash: 'hash' });
            (0, vitest_1.expect)(user.nome).toBe('Admin');
            (0, vitest_1.expect)(user.email).toBe('admin@greenpet.com');
            (0, vitest_1.expect)(user.loginAttempts).toBe(0);
            (0, vitest_1.expect)(user.lockedUntil).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('recordFailedLogin', () => {
        (0, vitest_1.it)('incrementa tentativas a cada chamada', () => {
            const user = user_entity_1.User.create({ nome: 'Admin', email: 'admin@greenpet.com', senhaHash: 'hash' });
            user.recordFailedLogin();
            user.recordFailedLogin();
            (0, vitest_1.expect)(user.loginAttempts).toBe(2);
            (0, vitest_1.expect)(user.isLocked).toBe(false);
        });
        (0, vitest_1.it)('bloqueia conta na 5ª falha e define lockedUntil', () => {
            const user = user_entity_1.User.create({ nome: 'Admin', email: 'admin@greenpet.com', senhaHash: 'hash' });
            for (let i = 0; i < 5; i++)
                user.recordFailedLogin();
            (0, vitest_1.expect)(user.isLocked).toBe(true);
            (0, vitest_1.expect)(user.lockedUntil).toBeDefined();
        });
        (0, vitest_1.it)('lockedUntil é aproximadamente 15 minutos no futuro', () => {
            const before = Date.now();
            const user = user_entity_1.User.create({ nome: 'Admin', email: 'admin@greenpet.com', senhaHash: 'hash' });
            for (let i = 0; i < 5; i++)
                user.recordFailedLogin();
            const lockMs = user.lockedUntil.getTime();
            (0, vitest_1.expect)(lockMs).toBeGreaterThan(before + 14 * 60 * 1000);
            (0, vitest_1.expect)(lockMs).toBeLessThan(before + 16 * 60 * 1000);
        });
    });
    (0, vitest_1.describe)('resetLoginAttempts', () => {
        (0, vitest_1.it)('zera tentativas e remove bloqueio', () => {
            const user = user_entity_1.User.create({ nome: 'Admin', email: 'admin@greenpet.com', senhaHash: 'hash' });
            for (let i = 0; i < 5; i++)
                user.recordFailedLogin();
            user.resetLoginAttempts();
            (0, vitest_1.expect)(user.loginAttempts).toBe(0);
            (0, vitest_1.expect)(user.isLocked).toBe(false);
            (0, vitest_1.expect)(user.lockedUntil).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('isLocked', () => {
        (0, vitest_1.it)('retorna false quando lockedUntil é no passado', () => {
            const user = user_entity_1.User.create({
                nome: 'Admin',
                email: 'a@b.com',
                senhaHash: 'h',
                loginAttempts: 5,
                lockedUntil: new Date(Date.now() - 1000),
            });
            (0, vitest_1.expect)(user.isLocked).toBe(false);
        });
        (0, vitest_1.it)('retorna true quando lockedUntil é no futuro', () => {
            const user = user_entity_1.User.create({
                nome: 'Admin',
                email: 'a@b.com',
                senhaHash: 'h',
                loginAttempts: 5,
                lockedUntil: new Date(Date.now() + 60_000),
            });
            (0, vitest_1.expect)(user.isLocked).toBe(true);
        });
    });
});
//# sourceMappingURL=user.entity.spec.js.map