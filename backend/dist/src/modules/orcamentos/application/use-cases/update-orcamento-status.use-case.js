"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrcamentoStatusUseCase = void 0;
const not_found_error_js_1 = require("../../../../shared/errors/not-found.error.js");
const validation_error_js_1 = require("../../../../shared/errors/validation.error.js");
class UpdateOrcamentoStatusUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute({ id, acao }) {
        const orcamento = await this.repo.findById(id);
        if (!orcamento)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Orçamento não encontrado');
        if (acao === 'aprovar')
            orcamento.aprovar();
        else if (acao === 'recusar')
            orcamento.recusar();
        else if (acao === 'reabrir')
            orcamento.reabrir();
        else
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', `Ação inválida: ${acao}`);
        await this.repo.save(orcamento);
        return orcamento;
    }
}
exports.UpdateOrcamentoStatusUseCase = UpdateOrcamentoStatusUseCase;
//# sourceMappingURL=update-orcamento-status.use-case.js.map