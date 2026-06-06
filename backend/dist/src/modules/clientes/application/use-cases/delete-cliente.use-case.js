"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteClienteUseCase = void 0;
const not_found_error_js_1 = require("../../../../shared/errors/not-found.error.js");
const unprocessable_error_js_1 = require("../../../../shared/errors/unprocessable.error.js");
class DeleteClienteUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute({ id }) {
        const cliente = await this.repo.findById(id);
        if (!cliente)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Cliente não encontrado');
        const hasLinks = await this.repo.hasActiveSalesOrQuotes(id);
        if (hasLinks) {
            throw new unprocessable_error_js_1.UnprocessableError('CLIENT_HAS_SALES', 'Cliente possui vendas ou orçamentos vinculados');
        }
        cliente.softDelete();
        await this.repo.save(cliente);
    }
}
exports.DeleteClienteUseCase = DeleteClienteUseCase;
//# sourceMappingURL=delete-cliente.use-case.js.map