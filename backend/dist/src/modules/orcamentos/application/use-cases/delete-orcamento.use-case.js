"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteOrcamentoUseCase = void 0;
const not_found_error_js_1 = require("../../../../shared/errors/not-found.error.js");
const unprocessable_error_js_1 = require("../../../../shared/errors/unprocessable.error.js");
class DeleteOrcamentoUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute({ id }) {
        const o = await this.repo.findById(id);
        if (!o)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Orçamento não encontrado');
        if (o.status === 'aprovado' && o.vendaId) {
            throw new unprocessable_error_js_1.UnprocessableError('CANNOT_DELETE_CONVERTED', 'Orçamento convertido em venda não pode ser removido');
        }
        await this.repo.delete(id);
    }
}
exports.DeleteOrcamentoUseCase = DeleteOrcamentoUseCase;
//# sourceMappingURL=delete-orcamento.use-case.js.map