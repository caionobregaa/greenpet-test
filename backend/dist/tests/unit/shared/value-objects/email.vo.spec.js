"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const email_vo_1 = require("../../../../src/shared/domain/value-objects/email.vo");
(0, vitest_1.describe)('Email', () => {
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('aceita e-mail válido', () => {
            const email = email_vo_1.Email.create('joao@example.com');
            (0, vitest_1.expect)(email.value).toBe('joao@example.com');
        });
        (0, vitest_1.it)('normaliza para minúsculas', () => {
            const email = email_vo_1.Email.create('JOAO@EXAMPLE.COM');
            (0, vitest_1.expect)(email.value).toBe('joao@example.com');
        });
        (0, vitest_1.it)('remove espaços', () => {
            const email = email_vo_1.Email.create('  joao@example.com  ');
            (0, vitest_1.expect)(email.value).toBe('joao@example.com');
        });
        (0, vitest_1.it)('rejeita e-mail sem @', () => {
            (0, vitest_1.expect)(() => email_vo_1.Email.create('joaoexample.com')).toThrow('E-mail inválido');
        });
        (0, vitest_1.it)('rejeita e-mail sem domínio', () => {
            (0, vitest_1.expect)(() => email_vo_1.Email.create('joao@')).toThrow('E-mail inválido');
        });
        (0, vitest_1.it)('rejeita string vazia', () => {
            (0, vitest_1.expect)(() => email_vo_1.Email.create('')).toThrow('E-mail inválido');
        });
    });
});
//# sourceMappingURL=email.vo.spec.js.map