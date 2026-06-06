"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCompraStatusUseCase = void 0;
const not_found_error_js_1 = require("../../../../shared/errors/not-found.error.js");
const validation_error_js_1 = require("../../../../shared/errors/validation.error.js");
class UpdateCompraStatusUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute({ id, acao }) {
        const compra = await this.repo.findById(id);
        if (!compra)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Compra não encontrada');
        if (acao === 'confirmar')
            compra.confirmar();
        else if (acao === 'receber')
            compra.receber();
        else if (acao === 'cancelar')
            compra.cancelar();
        else
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', `Ação inválida: ${acao}`);
        await this.repo.save(compra);
        return compra;
    }
}
exports.UpdateCompraStatusUseCase = UpdateCompraStatusUseCase;
//# sourceMappingURL=update-compra-status.use-case.js.map