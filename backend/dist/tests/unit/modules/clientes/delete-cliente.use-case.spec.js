"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const delete_cliente_use_case_1 = require("../../../../src/modules/clientes/application/use-cases/delete-cliente.use-case");
const in_memory_cliente_repository_1 = require("./fakes/in-memory-cliente.repository");
const cliente_entity_1 = require("../../../../src/modules/clientes/domain/entities/cliente.entity");
(0, vitest_1.describe)('DeleteClienteUseCase', () => {
    let repo;
    let useCase;
    (0, vitest_1.beforeEach)(() => {
        repo = new in_memory_cliente_repository_1.InMemoryClienteRepository();
        useCase = new delete_cliente_use_case_1.DeleteClienteUseCase(repo);
    });
    (0, vitest_1.it)('marca cliente como deletado quando sem vínculos', async () => {
        const c = cliente_entity_1.Cliente.create({ nome: 'João', telefone: '(92) 9 8765-4321' });
        await repo.save(c);
        await useCase.execute({ id: c.id });
        const updated = repo.items.find((i) => i.id === c.id);
        (0, vitest_1.expect)(updated.isActive).toBe(false);
    });
    (0, vitest_1.it)('lança NOT_FOUND quando cliente não existe', async () => {
        await (0, vitest_1.expect)(useCase.execute({ id: 'nao-existe-uuid-valido-1234567890' })).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
    (0, vitest_1.it)('lança CLIENT_HAS_SALES quando cliente tem vendas ativas', async () => {
        const c = cliente_entity_1.Cliente.create({ nome: 'João', telefone: '(92) 9 8765-4321' });
        await repo.save(c);
        repo.simulateActiveSales = true;
        await (0, vitest_1.expect)(useCase.execute({ id: c.id })).rejects.toMatchObject({ code: 'CLIENT_HAS_SALES' });
    });
});
//# sourceMappingURL=delete-cliente.use-case.spec.js.map