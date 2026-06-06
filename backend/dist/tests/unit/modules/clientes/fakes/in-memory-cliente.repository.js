"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryClienteRepository = void 0;
const cliente_entity_1 = require("../../../../../src/modules/clientes/domain/entities/cliente.entity");
class InMemoryClienteRepository {
    items = [];
    simulateActiveSales = false;
    /** Quando definido, numeroDeAnimais é computado dinamicamente a partir desta lista. */
    animalItems;
    withCount(c) {
        if (!this.animalItems)
            return c;
        const count = this.animalItems.filter((a) => a.clienteId === c.id && a.isActive).length;
        return cliente_entity_1.Cliente.create({
            id: c.id,
            nome: c.nome,
            telefone: c.telefone,
            email: c.email,
            cpf: c.cpf,
            endereco: c.endereco,
            bairro: c.bairro,
            cidade: c.cidade,
            obs: c.obs,
            deletedAt: c.deletedAt,
            numeroDeAnimais: count,
        });
    }
    async findById(id) {
        const found = this.items.find((c) => c.id === id && c.isActive);
        return found ? this.withCount(found) : null;
    }
    async findByEmail(email) {
        return this.items.find((c) => c.email === email && c.isActive) ?? null;
    }
    async findByCpf(cpf) {
        return this.items.find((c) => c.cpf === cpf && c.isActive) ?? null;
    }
    async findMany(params) {
        const filtered = this.items.filter((c) => {
            if (!c.isActive)
                return false;
            if (params.q)
                return c.nome.toLowerCase().includes(params.q.toLowerCase());
            return true;
        });
        const start = (params.page - 1) * params.limit;
        return {
            clientes: filtered.slice(start, start + params.limit).map((c) => this.withCount(c)),
            total: filtered.length,
        };
    }
    async save(cliente) {
        const idx = this.items.findIndex((c) => c.id === cliente.id);
        if (idx >= 0)
            this.items[idx] = cliente;
        else
            this.items.push(cliente);
    }
    async hasActiveSalesOrQuotes(_clienteId) {
        return this.simulateActiveSales;
    }
}
exports.InMemoryClienteRepository = InMemoryClienteRepository;
//# sourceMappingURL=in-memory-cliente.repository.js.map