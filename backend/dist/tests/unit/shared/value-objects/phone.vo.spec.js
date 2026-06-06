"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const phone_vo_1 = require("../../../../src/shared/domain/value-objects/phone.vo");
(0, vitest_1.describe)('Phone', () => {
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('aceita celular no formato (99) 9 9999-9999', () => {
            const p = phone_vo_1.Phone.create('(92) 9 8765-4321');
            (0, vitest_1.expect)(p.value).toBe('(92) 9 8765-4321');
        });
        (0, vitest_1.it)('aceita fixo no formato (99) 9999-9999', () => {
            const p = phone_vo_1.Phone.create('(92) 3307-1000');
            (0, vitest_1.expect)(p.value).toBe('(92) 3307-1000');
        });
        (0, vitest_1.it)('rejeita número sem DDD', () => {
            (0, vitest_1.expect)(() => phone_vo_1.Phone.create('9 8765-4321')).toThrow('Telefone inválido');
        });
        (0, vitest_1.it)('aceita 11 dígitos brutos e formata como celular', () => {
            const p = phone_vo_1.Phone.create('92987654321');
            (0, vitest_1.expect)(p.value).toBe('(92) 9 8765-4321');
        });
        (0, vitest_1.it)('aceita 10 dígitos brutos e formata como fixo', () => {
            const p = phone_vo_1.Phone.create('9233071000');
            (0, vitest_1.expect)(p.value).toBe('(92) 3307-1000');
        });
        (0, vitest_1.it)('rejeita número com dígitos insuficientes', () => {
            (0, vitest_1.expect)(() => phone_vo_1.Phone.create('929876')).toThrow('Telefone inválido');
        });
        (0, vitest_1.it)('rejeita string vazia', () => {
            (0, vitest_1.expect)(() => phone_vo_1.Phone.create('')).toThrow('Telefone inválido');
        });
    });
    (0, vitest_1.describe)('equals', () => {
        (0, vitest_1.it)('dois telefones iguais retornam true', () => {
            const a = phone_vo_1.Phone.create('(92) 9 8765-4321');
            const b = phone_vo_1.Phone.create('(92) 9 8765-4321');
            (0, vitest_1.expect)(a.equals(b)).toBe(true);
        });
        (0, vitest_1.it)('dois telefones diferentes retornam false', () => {
            const a = phone_vo_1.Phone.create('(92) 9 8765-4321');
            const b = phone_vo_1.Phone.create('(92) 3307-1000');
            (0, vitest_1.expect)(a.equals(b)).toBe(false);
        });
    });
});
//# sourceMappingURL=phone.vo.spec.js.map