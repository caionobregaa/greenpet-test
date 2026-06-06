"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOrcamentoUseCase = void 0;
const not_found_error_js_1 = require("../../../../shared/errors/not-found.error.js");
class GetOrcamentoUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute({ id }) {
        const o = await this.repo.findById(id);
        if (!o)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Orçamento não encontrado');
        return o;
    }
}
exports.GetOrcamentoUseCase = GetOrcamentoUseCase;
//# sourceMappingURL=get-orcamento.use-case.js.map