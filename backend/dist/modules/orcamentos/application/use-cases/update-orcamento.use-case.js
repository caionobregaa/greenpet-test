"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrcamentoUseCase = void 0;
const not_found_error_js_1 = require("../../../../src/shared/errors/not-found.error.js");
class UpdateOrcamentoUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(input) {
        const orcamento = await this.repo.findById(input.id);
        if (!orcamento)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Orçamento não encontrado');
        orcamento.update({
            validade: input.validade,
            obs: input.obs,
            itens: input.itens,
        });
        await this.repo.save(orcamento);
        return orcamento;
    }
}
exports.UpdateOrcamentoUseCase = UpdateOrcamentoUseCase;
//# sourceMappingURL=update-orcamento.use-case.js.map