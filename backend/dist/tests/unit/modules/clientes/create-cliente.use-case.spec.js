"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const create_cliente_use_case_1 = require("../../../../src/modules/clientes/application/use-cases/create-cliente.use-case");
const in_memory_cliente_repository_1 = require("./fakes/in-memory-cliente.repository");
(0, vitest_1.describe)('CreateClienteUseCase', () => {
    let repo;
    let useCase;
    (0, vitest_1.beforeEach)(() => {
        repo = new in_memory_cliente_repository_1.InMemoryClienteRepository();
        useCase = new create_cliente_use_case_1.CreateClienteUseCase(repo);
    });
    (0, vitest_1.it)('cria cliente com dados válidos', async () => {
        const cliente = await useCase.execute({
            nome: 'João Silva',
            telefone: '(92) 9 8765-4321',
        });
        (0, vitest_1.expect)(cliente.id).toBeTruthy();
        (0, vitest_1.expect)(cliente.nome).toBe('João Silva');
        (0, vitest_1.expect)(repo.items).toHaveLength(1);
    });
    (0, vitest_1.it)('lança EMAIL_ALREADY_EXISTS quando e-mail já existe', async () => {
        await useCase.execute({
            nome: 'João',
            telefone: '(92) 9 8765-4321',
            email: 'joao@test.com',
        });
        await (0, vitest_1.expect)(useCase.execute({ nome: 'Maria', telefone: '(92) 9 1111-2222', email: 'joao@test.com' })).rejects.toMatchObject({ code: 'EMAIL_ALREADY_EXISTS' });
    });
    (0, vitest_1.it)('lança CPF_ALREADY_EXISTS quando CPF já existe', async () => {
        await useCase.execute({
            nome: 'João',
            telefone: '(92) 9 8765-4321',
            cpf: '529.982.247-25',
        });
        await (0, vitest_1.expect)(useCase.execute({ nome: 'Maria', telefone: '(92) 9 1111-2222', cpf: '529.982.247-25' })).rejects.toMatchObject({ code: 'CPF_ALREADY_EXISTS' });
    });
});
//# sourceMappingURL=create-cliente.use-case.spec.js.map