"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClienteUseCase = void 0;
const not_found_error_js_1 = require("../../../../src/shared/errors/not-found.error.js");
const conflict_error_js_1 = require("../../../../src/shared/errors/conflict.error.js");
class UpdateClienteUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(input) {
        const { id, ...fields } = input;
        const cliente = await this.repo.findById(id);
        if (!cliente)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Cliente não encontrado');
        if (fields.email && fields.email !== cliente.email) {
            const conflict = await this.repo.findByEmail(fields.email);
            if (conflict)
                throw new conflict_error_js_1.ConflictError('EMAIL_ALREADY_EXISTS', 'E-mail já cadastrado');
        }
        if (fields.cpf && fields.cpf !== cliente.cpf) {
            const conflict = await this.repo.findByCpf(fields.cpf);
            if (conflict)
                throw new conflict_error_js_1.ConflictError('CPF_ALREADY_EXISTS', 'CPF já cadastrado');
        }
        cliente.update(fields);
        await this.repo.save(cliente);
        return cliente;
    }
}
exports.UpdateClienteUseCase = UpdateClienteUseCase;
//# sourceMappingURL=update-cliente.use-case.js.map