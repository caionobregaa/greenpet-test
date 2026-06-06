"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const uuid_vo_1 = require("../../../../src/shared/domain/value-objects/uuid.vo");
(0, vitest_1.describe)('UUID', () => {
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('gera UUID v4 aleatório quando nenhum valor é passado', () => {
            const uuid = uuid_vo_1.UUID.create();
            (0, vitest_1.expect)(uuid.value).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        });
        (0, vitest_1.it)('aceita UUID v4 válido', () => {
            const id = '550e8400-e29b-41d4-a716-446655440000';
            const uuid = uuid_vo_1.UUID.create(id);
            (0, vitest_1.expect)(uuid.value).toBe(id);
        });
        (0, vitest_1.it)('rejeita string não UUID', () => {
            (0, vitest_1.expect)(() => uuid_vo_1.UUID.create('nao-e-uuid')).toThrow('UUID inválido');
        });
        (0, vitest_1.it)('rejeita string vazia', () => {
            (0, vitest_1.expect)(() => uuid_vo_1.UUID.create('')).toThrow('UUID inválido');
        });
    });
    (0, vitest_1.describe)('equals', () => {
        (0, vitest_1.it)('dois UUIDs com o mesmo valor são iguais', () => {
            const id = '550e8400-e29b-41d4-a716-446655440000';
            (0, vitest_1.expect)(uuid_vo_1.UUID.create(id).equals(uuid_vo_1.UUID.create(id))).toBe(true);
        });
        (0, vitest_1.it)('dois UUIDs diferentes não são iguais', () => {
            const a = uuid_vo_1.UUID.create();
            const b = uuid_vo_1.UUID.create();
            (0, vitest_1.expect)(a.equals(b)).toBe(false);
        });
    });
    (0, vitest_1.describe)('toString', () => {
        (0, vitest_1.it)('retorna o valor como string', () => {
            const id = '550e8400-e29b-41d4-a716-446655440000';
            (0, vitest_1.expect)(uuid_vo_1.UUID.create(id).toString()).toBe(id);
        });
    });
});
//# sourceMappingURL=uuid.vo.spec.js.map