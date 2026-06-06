"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteProdutoUseCase = void 0;
const not_found_error_js_1 = require("../../../../src/shared/errors/not-found.error.js");
class DeleteProdutoUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute({ id }) {
        const produto = await this.repo.findById(id);
        if (!produto)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Produto não encontrado');
        produto.softDelete();
        await this.repo.save(produto);
    }
}
exports.DeleteProdutoUseCase = DeleteProdutoUseCase;
//# sourceMappingURL=delete-produto.use-case.js.map