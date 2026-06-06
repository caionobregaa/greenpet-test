"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const orcamento_entity_1 = require("../../../../src/modules/orcamentos/domain/entities/orcamento.entity");
(0, vitest_1.describe)('Orcamento entity', () => {
    const clienteId = crypto.randomUUID();
    function makeOrcamento(overrides) {
        return orcamento_entity_1.Orcamento.create({
            clienteId,
            validade: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            itens: [{ nome: 'Ração', qtd: 1, valorUnitario: 100 }],
            ...overrides,
        });
    }
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('cria orçamento com status pendente por padrão', () => {
            const o = makeOrcamento();
            (0, vitest_1.expect)(o.status).toBe('pendente');
            (0, vitest_1.expect)(o.total).toBe(100);
        });
    });
    (0, vitest_1.describe)('transições de status', () => {
        (0, vitest_1.it)('pendente → aprovado', () => {
            const o = makeOrcamento();
            o.aprovar();
            (0, vitest_1.expect)(o.status).toBe('aprovado');
        });
        (0, vitest_1.it)('pendente → recusado', () => {
            const o = makeOrcamento();
            o.recusar();
            (0, vitest_1.expect)(o.status).toBe('recusado');
        });
        (0, vitest_1.it)('recusado → pendente (reabrir)', () => {
            const o = makeOrcamento();
            o.recusar();
            o.reabrir();
            (0, vitest_1.expect)(o.status).toBe('pendente');
        });
        (0, vitest_1.it)('aprovado → pendente lança INVALID_STATUS_TRANSITION', () => {
            const o = makeOrcamento();
            o.aprovar();
            let err;
            try {
                o.reabrir();
            }
            catch (e) {
                err = e;
            }
            (0, vitest_1.expect)(err?.code).toBe('INVALID_STATUS_TRANSITION');
        });
        (0, vitest_1.it)('aprovado → recusado lança INVALID_STATUS_TRANSITION', () => {
            const o = makeOrcamento();
            o.aprovar();
            let err;
            try {
                o.recusar();
            }
            catch (e) {
                err = e;
            }
            (0, vitest_1.expect)(err?.code).toBe('INVALID_STATUS_TRANSITION');
        });
    });
    (0, vitest_1.describe)('vencido', () => {
        (0, vitest_1.it)('retorna true quando validade é passada e status é pendente', () => {
            const o = makeOrcamento({ validade: new Date(Date.now() - 1000) });
            (0, vitest_1.expect)(o.vencido).toBe(true);
        });
        (0, vitest_1.it)('retorna false quando validade é futura', () => {
            const o = makeOrcamento();
            (0, vitest_1.expect)(o.vencido).toBe(false);
        });
        (0, vitest_1.it)('retorna false quando status é aprovado (já convertido)', () => {
            const o = makeOrcamento({ validade: new Date(Date.now() - 1000) });
            o.aprovar();
            (0, vitest_1.expect)(o.vencido).toBe(false);
        });
    });
});
//# sourceMappingURL=orcamento.entity.spec.js.map