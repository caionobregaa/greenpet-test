"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const cpf_vo_1 = require("../../../../src/shared/domain/value-objects/cpf.vo");
(0, vitest_1.describe)('CPF', () => {
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('aceita CPF válido formatado', () => {
            const cpf = cpf_vo_1.CPF.create('529.982.247-25');
            (0, vitest_1.expect)(cpf.value).toBe('529.982.247-25');
        });
        (0, vitest_1.it)('aceita CPF válido sem formatação (só dígitos)', () => {
            const cpf = cpf_vo_1.CPF.create('52998224725');
            (0, vitest_1.expect)(cpf.value).toBe('529.982.247-25');
        });
        (0, vitest_1.it)('rejeita CPF com todos dígitos iguais', () => {
            (0, vitest_1.expect)(() => cpf_vo_1.CPF.create('000.000.000-00')).toThrow('CPF inválido');
            (0, vitest_1.expect)(() => cpf_vo_1.CPF.create('111.111.111-11')).toThrow('CPF inválido');
            (0, vitest_1.expect)(() => cpf_vo_1.CPF.create('99999999999')).toThrow('CPF inválido');
        });
        (0, vitest_1.it)('rejeita CPF com dígito verificador errado', () => {
            (0, vitest_1.expect)(() => cpf_vo_1.CPF.create('529.982.247-26')).toThrow('CPF inválido');
        });
        (0, vitest_1.it)('rejeita CPF com menos de 11 dígitos', () => {
            (0, vitest_1.expect)(() => cpf_vo_1.CPF.create('123.456.789')).toThrow('CPF deve conter 11 dígitos');
        });
        (0, vitest_1.it)('rejeita CPF com mais de 11 dígitos', () => {
            (0, vitest_1.expect)(() => cpf_vo_1.CPF.create('123.456.789-001')).toThrow('CPF deve conter 11 dígitos');
        });
    });
    (0, vitest_1.describe)('equals', () => {
        (0, vitest_1.it)('dois CPFs com o mesmo valor são iguais', () => {
            const a = cpf_vo_1.CPF.create('529.982.247-25');
            const b = cpf_vo_1.CPF.create('52998224725');
            (0, vitest_1.expect)(a.equals(b)).toBe(true);
        });
        (0, vitest_1.it)('dois CPFs com valores diferentes não são iguais', () => {
            const a = cpf_vo_1.CPF.create('529.982.247-25');
            const b = cpf_vo_1.CPF.create('111.444.777-35');
            (0, vitest_1.expect)(a.equals(b)).toBe(false);
        });
    });
});
//# sourceMappingURL=cpf.vo.spec.js.map