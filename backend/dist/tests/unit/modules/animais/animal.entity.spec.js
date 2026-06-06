"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const animal_entity_1 = require("../../../../src/modules/animais/domain/entities/animal.entity");
(0, vitest_1.describe)('Animal entity', () => {
    const clienteId = crypto.randomUUID();
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('cria animal com dados válidos', () => {
            const a = animal_entity_1.Animal.create({ nome: 'Rex', clienteId, especie: 'Cão' });
            (0, vitest_1.expect)(a.nome).toBe('Rex');
            (0, vitest_1.expect)(a.especie).toBe('Cão');
            (0, vitest_1.expect)(a.sexo).toBe('Indefinido');
            (0, vitest_1.expect)(a.isActive).toBe(true);
        });
        (0, vitest_1.it)('rejeita espécie inválida', () => {
            (0, vitest_1.expect)(() => animal_entity_1.Animal.create({ nome: 'Rex', clienteId, especie: 'Hamster' })).toThrow('Espécie inválida');
        });
        (0, vitest_1.it)('rejeita sexo inválido', () => {
            (0, vitest_1.expect)(() => animal_entity_1.Animal.create({ nome: 'Rex', clienteId, especie: 'Gato', sexo: 'X' })).toThrow('Sexo inválido');
        });
    });
    (0, vitest_1.describe)('idadeCalculada', () => {
        (0, vitest_1.it)('retorna null quando nascimento não informado', () => {
            const a = animal_entity_1.Animal.create({ nome: 'Rex', clienteId, especie: 'Cão' });
            (0, vitest_1.expect)(a.idadeCalculada).toBeNull();
        });
        (0, vitest_1.it)('retorna anos e meses quando nascimento informado', () => {
            const nascimento = new Date();
            nascimento.setFullYear(nascimento.getFullYear() - 2);
            nascimento.setMonth(nascimento.getMonth() - 3);
            const a = animal_entity_1.Animal.create({ nome: 'Rex', clienteId, especie: 'Cão', nascimento });
            (0, vitest_1.expect)(a.idadeCalculada).toMatchObject({ anos: 2, meses: 3 });
        });
    });
    (0, vitest_1.describe)('softDelete', () => {
        (0, vitest_1.it)('marca deletedAt e isActive fica false', () => {
            const a = animal_entity_1.Animal.create({ nome: 'Rex', clienteId, especie: 'Cão' });
            a.softDelete();
            (0, vitest_1.expect)(a.isActive).toBe(false);
        });
    });
});
//# sourceMappingURL=animal.entity.spec.js.map