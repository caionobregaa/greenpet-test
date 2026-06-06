"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const compra_entity_1 = require("../../../../src/modules/compras/domain/entities/compra.entity");
(0, vitest_1.describe)('Compra entity', () => {
    function makeCompra() {
        return compra_entity_1.Compra.create({
            fornecedor: 'Fornecedor ABC',
            itens: [{ nome: 'Ração 15kg', qtd: 10, valorUnitario: 80 }],
        });
    }
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('cria compra com status pendente e total calculado', () => {
            const c = makeCompra();
            (0, vitest_1.expect)(c.status).toBe('pendente');
            (0, vitest_1.expect)(c.total).toBe(800);
            (0, vitest_1.expect)(c.fornecedor).toBe('Fornecedor ABC');
        });
    });
    (0, vitest_1.describe)('transições de status', () => {
        (0, vitest_1.it)('pendente → confirmado', () => {
            const c = makeCompra();
            c.confirmar();
            (0, vitest_1.expect)(c.status).toBe('confirmado');
        });
        (0, vitest_1.it)('confirmado → recebido', () => {
            const c = makeCompra();
            c.confirmar();
            c.receber();
            (0, vitest_1.expect)(c.status).toBe('recebido');
        });
        (0, vitest_1.it)('pendente → cancelado', () => {
            const c = makeCompra();
            c.cancelar();
            (0, vitest_1.expect)(c.status).toBe('cancelado');
        });
        (0, vitest_1.it)('confirmado não pode ser cancelado', () => {
            const c = makeCompra();
            c.confirmar();
            let err;
            try {
                c.cancelar();
            }
            catch (e) {
                err = e;
            }
            (0, vitest_1.expect)(err?.code).toBe('INVALID_STATUS_TRANSITION');
        });
        (0, vitest_1.it)('recebido não pode ser editado', () => {
            const c = makeCompra();
            c.confirmar();
            c.receber();
            let err;
            try {
                c.assertEditavel();
            }
            catch (e) {
                err = e;
            }
            (0, vitest_1.expect)(err?.code).toBe('CANNOT_EDIT');
        });
    });
    (0, vitest_1.describe)('assertEditavel', () => {
        (0, vitest_1.it)('pendente é editável', () => {
            const c = makeCompra();
            (0, vitest_1.expect)(() => c.assertEditavel()).not.toThrow();
        });
        (0, vitest_1.it)('confirmado não é editável', () => {
            const c = makeCompra();
            c.confirmar();
            let err;
            try {
                c.assertEditavel();
            }
            catch (e) {
                err = e;
            }
            (0, vitest_1.expect)(err?.code).toBe('CANNOT_EDIT');
        });
    });
});
//# sourceMappingURL=compra.entity.spec.js.map