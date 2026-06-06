"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCompraUseCase = void 0;
const not_found_error_js_1 = require("../../../../src/shared/errors/not-found.error.js");
class GetCompraUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute({ id }) {
        const compra = await this.repo.findById(id);
        if (!compra)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Compra não encontrada');
        return compra;
    }
}
exports.GetCompraUseCase = GetCompraUseCase;
//# sourceMappingURL=get-compra.use-case.js.map