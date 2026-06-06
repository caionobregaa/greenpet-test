"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCompraUseCase = void 0;
const not_found_error_js_1 = require("../../../../src/shared/errors/not-found.error.js");
class UpdateCompraUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(input) {
        const { id, ...fields } = input;
        const compra = await this.repo.findById(id);
        if (!compra)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Compra não encontrada');
        compra.update(fields);
        await this.repo.save(compra);
        return compra;
    }
}
exports.UpdateCompraUseCase = UpdateCompraUseCase;
//# sourceMappingURL=update-compra.use-case.js.map