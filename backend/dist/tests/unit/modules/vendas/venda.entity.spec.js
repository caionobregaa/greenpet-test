"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const venda_entity_1 = require("../../../../src/modules/vendas/domain/entities/venda.entity");
(0, vitest_1.describe)('Venda entity', () => {
    const clienteId = crypto.randomUUID();
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('cria venda com itens e calcula total', () => {
            const venda = venda_entity_1.Venda.create({
                clienteId,
                formaPag: 'Pix',
                itens: [
                    { nome: 'Ração Premium', qtd: 2, valorUnitario: 50 },
                    { nome: 'Petisco', qtd: 1, valorUnitario: 15 },
                ],
            });
            (0, vitest_1.expect)(venda.total).toBe(115);
            (0, vitest_1.expect)(venda.itens).toHaveLength(2);
            (0, vitest_1.expect)(venda.formaPag).toBe('Pix');
        });
        (0, vitest_1.it)('rejeita forma de pagamento inválida', () => {
            (0, vitest_1.expect)(() => venda_entity_1.Venda.create({
                clienteId,
                formaPag: 'Cheque',
                itens: [{ nome: 'Ração', qtd: 1, valorUnitario: 50 }],
            })).toThrow('Forma de pagamento inválida');
        });
        (0, vitest_1.it)('rejeita venda sem itens', () => {
            (0, vitest_1.expect)(() => venda_entity_1.Venda.create({ clienteId, formaPag: 'Pix', itens: [] })).toThrow('Venda deve ter ao menos 1 item');
        });
        (0, vitest_1.it)('rejeita quantidade zero ou negativa', () => {
            (0, vitest_1.expect)(() => venda_entity_1.Venda.create({
                clienteId,
                formaPag: 'Pix',
                itens: [{ nome: 'Ração', qtd: 0, valorUnitario: 50 }],
            })).toThrow('Quantidade deve ser maior que zero');
        });
    });
    (0, vitest_1.it)('snapshots de nome e valorUnitario são preservados no item', () => {
        const venda = venda_entity_1.Venda.create({
            clienteId,
            formaPag: 'Dinheiro',
            itens: [{ nome: 'Produto Snapshot', qtd: 3, valorUnitario: 25, produtoId: crypto.randomUUID() }],
        });
        (0, vitest_1.expect)(venda.itens[0].nome).toBe('Produto Snapshot');
        (0, vitest_1.expect)(venda.itens[0].valorUnitario).toBe(25);
        (0, vitest_1.expect)(venda.itens[0].total).toBe(75);
    });
});
//# sourceMappingURL=venda.entity.spec.js.map