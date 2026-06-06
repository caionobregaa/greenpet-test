"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetClienteUseCase = void 0;
const not_found_error_js_1 = require("../../../../src/shared/errors/not-found.error.js");
class GetClienteUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute({ id }) {
        const cliente = await this.repo.findById(id);
        if (!cliente)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Cliente não encontrado');
        return cliente;
    }
}
exports.GetClienteUseCase = GetClienteUseCase;
//# sourceMappingURL=get-cliente.use-case.js.map