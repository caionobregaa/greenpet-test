"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateClienteUseCase = void 0;
const cliente_entity_js_1 = require("../../domain/entities/cliente.entity.js");
const conflict_error_js_1 = require("../../../../src/shared/errors/conflict.error.js");
class CreateClienteUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(input) {
        if (input.email) {
            const existing = await this.repo.findByEmail(input.email);
            if (existing)
                throw new conflict_error_js_1.ConflictError('EMAIL_ALREADY_EXISTS', 'E-mail já cadastrado');
        }
        if (input.cpf) {
            const existing = await this.repo.findByCpf(input.cpf);
            if (existing)
                throw new conflict_error_js_1.ConflictError('CPF_ALREADY_EXISTS', 'CPF já cadastrado');
        }
        const cliente = cliente_entity_js_1.Cliente.create(input);
        await this.repo.save(cliente);
        return cliente;
    }
}
exports.CreateClienteUseCase = CreateClienteUseCase;
//# sourceMappingURL=create-cliente.use-case.js.map