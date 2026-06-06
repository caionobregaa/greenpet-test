"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const produto_entity_1 = require("../../../../src/modules/produtos/domain/entities/produto.entity");
(0, vitest_1.describe)('Produto entity', () => {
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('cria produto com dados válidos', () => {
            const p = produto_entity_1.Produto.create({
                nome: 'Ração Premium',
                categoria: 'Ração',
                valorVenda: 150,
                valorCusto: 90,
            });
            (0, vitest_1.expect)(p.nome).toBe('Ração Premium');
            (0, vitest_1.expect)(p.valorVenda).toBe(150);
            (0, vitest_1.expect)(p.isActive).toBe(true);
        });
        (0, vitest_1.it)('rejeita valorVenda negativo', () => {
            (0, vitest_1.expect)(() => produto_entity_1.Produto.create({ nome: 'Ração', categoria: 'Ração', valorVenda: -10 })).toThrow('Valor monetário não pode ser negativo');
        });
        (0, vitest_1.it)('rejeita categoria inválida', () => {
            (0, vitest_1.expect)(() => produto_entity_1.Produto.create({ nome: 'Ração', categoria: 'Inválido', valorVenda: 10 })).toThrow('Categoria inválida');
        });
    });
    (0, vitest_1.describe)('margemCalculada', () => {
        (0, vitest_1.it)('calcula margem corretamente: (venda - custo) / venda * 100', () => {
            const p = produto_entity_1.Produto.create({
                nome: 'Ração',
                categoria: 'Ração',
                valorVenda: 100,
                valorCusto: 60,
            });
            (0, vitest_1.expect)(p.margemCalculada).toBeCloseTo(40);
        });
        (0, vitest_1.it)('retorna 0 quando valorVenda é 0', () => {
            const p = produto_entity_1.Produto.create({ nome: 'Ração', categoria: 'Ração', valorVenda: 0 });
            (0, vitest_1.expect)(p.margemCalculada).toBe(0);
        });
    });
    (0, vitest_1.describe)('softDelete', () => {
        (0, vitest_1.it)('marca deletedAt e isActive fica false', () => {
            const p = produto_entity_1.Produto.create({ nome: 'Ração', categoria: 'Ração', valorVenda: 10 });
            p.softDelete();
            (0, vitest_1.expect)(p.isActive).toBe(false);
        });
    });
});
//# sourceMappingURL=produto.entity.spec.js.map