"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteVendaUseCase = void 0;
const not_found_error_js_1 = require("@/shared/errors/not-found.error.js");
class DeleteVendaUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute({ id }) {
        const venda = await this.repo.findById(id);
        if (!venda)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Venda não encontrada');
        await this.repo.delete(id);
    }
}
exports.DeleteVendaUseCase = DeleteVendaUseCase;
//# sourceMappingURL=delete-venda.use-case.js.map