"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const password_vo_1 = require("../../../../src/modules/auth/domain/value-objects/password.vo");
(0, vitest_1.describe)('Password VO', () => {
    (0, vitest_1.describe)('validate', () => {
        (0, vitest_1.it)('aceita senha com 8+ caracteres, 1 letra e 1 número', () => {
            (0, vitest_1.expect)(() => password_vo_1.Password.validate('senha123')).not.toThrow();
        });
        (0, vitest_1.it)('rejeita senha com menos de 8 caracteres', () => {
            (0, vitest_1.expect)(() => password_vo_1.Password.validate('abc1')).toThrow('Senha deve ter no mínimo 8 caracteres');
        });
        (0, vitest_1.it)('rejeita senha sem número', () => {
            (0, vitest_1.expect)(() => password_vo_1.Password.validate('senhasemnum')).toThrow('Senha deve conter pelo menos 1 número');
        });
        (0, vitest_1.it)('rejeita senha sem letra', () => {
            (0, vitest_1.expect)(() => password_vo_1.Password.validate('12345678')).toThrow('Senha deve conter pelo menos 1 letra');
        });
    });
    (0, vitest_1.describe)('fromHash', () => {
        (0, vitest_1.it)('cria VO a partir de hash existente sem validar', () => {
            const pwd = password_vo_1.Password.fromHash('$2b$12$somehashvalue');
            (0, vitest_1.expect)(pwd.hash).toBe('$2b$12$somehashvalue');
        });
    });
});
//# sourceMappingURL=password.vo.spec.js.map