"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const money_vo_1 = require("../../../../src/shared/domain/value-objects/money.vo");
(0, vitest_1.describe)('Money', () => {
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('cria valor monetário positivo', () => {
            const m = money_vo_1.Money.create(100.5);
            (0, vitest_1.expect)(m.value).toBe(100.5);
        });
        (0, vitest_1.it)('aceita zero', () => {
            const m = money_vo_1.Money.create(0);
            (0, vitest_1.expect)(m.value).toBe(0);
        });
        (0, vitest_1.it)('rejeita valor negativo', () => {
            (0, vitest_1.expect)(() => money_vo_1.Money.create(-1)).toThrow('Valor monetário não pode ser negativo');
        });
        (0, vitest_1.it)('rejeita NaN', () => {
            (0, vitest_1.expect)(() => money_vo_1.Money.create(NaN)).toThrow('Valor monetário deve ser um número');
        });
        (0, vitest_1.it)('arredonda para 2 casas decimais', () => {
            const m = money_vo_1.Money.create(10.999);
            (0, vitest_1.expect)(m.value).toBe(11);
        });
    });
    (0, vitest_1.describe)('add', () => {
        (0, vitest_1.it)('soma dois valores corretamente', () => {
            const a = money_vo_1.Money.create(10.5);
            const b = money_vo_1.Money.create(5.5);
            (0, vitest_1.expect)(a.add(b).value).toBe(16);
        });
    });
    (0, vitest_1.describe)('multiply', () => {
        (0, vitest_1.it)('multiplica por quantidade', () => {
            const m = money_vo_1.Money.create(25);
            (0, vitest_1.expect)(m.multiply(3).value).toBe(75);
        });
    });
    (0, vitest_1.describe)('toString', () => {
        (0, vitest_1.it)('retorna string com 2 casas decimais', () => {
            (0, vitest_1.expect)(money_vo_1.Money.create(10).toString()).toBe('10.00');
        });
    });
});
//# sourceMappingURL=money.vo.spec.js.map