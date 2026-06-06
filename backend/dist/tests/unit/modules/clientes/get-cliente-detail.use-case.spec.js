"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const get_cliente_detail_use_case_1 = require("../../../../src/modules/clientes/application/use-cases/get-cliente-detail.use-case");
const in_memory_cliente_repository_1 = require("./fakes/in-memory-cliente.repository");
const cliente_entity_1 = require("../../../../src/modules/clientes/domain/entities/cliente.entity");
const animal_entity_1 = require("../../../../src/modules/animais/domain/entities/animal.entity");
const venda_entity_1 = require("../../../../src/modules/vendas/domain/entities/venda.entity");
class InMemoryAnimalRepository {
    items = [];
    async findById(id) {
        return this.items.find((a) => a.id === id && a.isActive) ?? null;
    }
    async findMany(params) {
        const filtered = this.items.filter((a) => {
            if (!a.isActive)
                return false;
            if (params.clienteId)
                return a.clienteId === params.clienteId;
            return true;
        });
        return { animais: filtered, clienteNomes: {}, total: filtered.length };
    }
    async save(animal) {
        const idx = this.items.findIndex((a) => a.id === animal.id);
        if (idx >= 0)
            this.items[idx] = animal;
        else
            this.items.push(animal);
    }
}
class InMemoryVendaRepository {
    items = [];
    async findById(id) {
        return this.items.find((v) => v.id === id) ?? null;
    }
    async findMany(params) {
        const filtered = this.items.filter((v) => {
            if (params.clienteId && v.clienteId !== params.clienteId)
                return false;
            if (params.animalId && v.animalId !== params.animalId)
                return false;
            return true;
        });
        return { vendas: filtered, total: filtered.length };
    }
    async save(venda) {
        this.items.push(venda);
    }
    async delete(id) {
        this.items = this.items.filter((v) => v.id !== id);
    }
}
(0, vitest_1.describe)('GetClienteDetailUseCase', () => {
    let clienteRepo;
    let animalRepo;
    let vendaRepo;
    let useCase;
    (0, vitest_1.beforeEach)(() => {
        clienteRepo = new in_memory_cliente_repository_1.InMemoryClienteRepository();
        animalRepo = new InMemoryAnimalRepository();
        vendaRepo = new InMemoryVendaRepository();
        useCase = new get_cliente_detail_use_case_1.GetClienteDetailUseCase(clienteRepo, animalRepo, vendaRepo);
    });
    (0, vitest_1.it)('retorna cliente com animais e vendas relacionados', async () => {
        const cliente = cliente_entity_1.Cliente.create({ nome: 'Maria Silva', telefone: '(92) 9 8765-4321' });
        await clienteRepo.save(cliente);
        const animal = animal_entity_1.Animal.create({ nome: 'Rex', clienteId: cliente.id, especie: 'Cão' });
        await animalRepo.save(animal);
        const venda = venda_entity_1.Venda.create({
            clienteId: cliente.id,
            formaPag: 'Pix',
            itens: [{ nome: 'Ração', qtd: 1, valorUnitario: 50 }],
        });
        await vendaRepo.save(venda);
        const result = await useCase.execute({ id: cliente.id });
        (0, vitest_1.expect)(result.cliente.id).toBe(cliente.id);
        (0, vitest_1.expect)(result.animais).toHaveLength(1);
        (0, vitest_1.expect)(result.animais[0].nome).toBe('Rex');
        (0, vitest_1.expect)(result.vendas).toHaveLength(1);
        (0, vitest_1.expect)(result.vendas[0].formaPag).toBe('Pix');
    });
    (0, vitest_1.it)('retorna arrays vazios quando cliente não tem animais nem vendas', async () => {
        const cliente = cliente_entity_1.Cliente.create({ nome: 'João Sem Pet', telefone: '(92) 9 1111-2222' });
        await clienteRepo.save(cliente);
        const result = await useCase.execute({ id: cliente.id });
        (0, vitest_1.expect)(result.cliente.id).toBe(cliente.id);
        (0, vitest_1.expect)(result.animais).toHaveLength(0);
        (0, vitest_1.expect)(result.vendas).toHaveLength(0);
    });
    (0, vitest_1.it)('não retorna animais de outros clientes', async () => {
        const c1 = cliente_entity_1.Cliente.create({ nome: 'Cliente Um', telefone: '(92) 9 1111-2222' });
        const c2 = cliente_entity_1.Cliente.create({ nome: 'Cliente Dois', telefone: '(92) 9 3333-4444' });
        await clienteRepo.save(c1);
        await clienteRepo.save(c2);
        const animalC2 = animal_entity_1.Animal.create({ nome: 'Mimi', clienteId: c2.id, especie: 'Gato' });
        await animalRepo.save(animalC2);
        const result = await useCase.execute({ id: c1.id });
        (0, vitest_1.expect)(result.animais).toHaveLength(0);
    });
    (0, vitest_1.it)('lança NOT_FOUND quando cliente não existe', async () => {
        await (0, vitest_1.expect)(useCase.execute({ id: 'id-inexistente' })).rejects.toMatchObject({
            code: 'NOT_FOUND',
        });
    });
    (0, vitest_1.it)('animal excluído não é contabilizado em numeroDeAnimais', async () => {
        clienteRepo.animalItems = animalRepo.items;
        const cliente = cliente_entity_1.Cliente.create({ nome: 'Pedro Silva', telefone: '(92) 9 9999-1111' });
        await clienteRepo.save(cliente);
        const animal = animal_entity_1.Animal.create({ nome: 'Thor', clienteId: cliente.id, especie: 'Cão' });
        await animalRepo.save(animal);
        const antes = await useCase.execute({ id: cliente.id });
        (0, vitest_1.expect)(antes.animais).toHaveLength(1);
        (0, vitest_1.expect)(antes.cliente.numeroDeAnimais).toBe(1);
        animal.softDelete();
        await animalRepo.save(animal);
        const depois = await useCase.execute({ id: cliente.id });
        (0, vitest_1.expect)(depois.animais).toHaveLength(0);
        (0, vitest_1.expect)(depois.cliente.numeroDeAnimais).toBe(0);
    });
});
//# sourceMappingURL=get-cliente-detail.use-case.spec.js.map