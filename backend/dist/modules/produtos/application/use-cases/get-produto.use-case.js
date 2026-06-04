"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProdutoUseCase = void 0;
const not_found_error_js_1 = require("@/shared/errors/not-found.error.js");
class GetProdutoUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute({ id }) {
        const produto = await this.repo.findById(id);
        if (!produto)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Produto não encontrado');
        return produto;
    }
}
exports.GetProdutoUseCase = GetProdutoUseCase;
//# sourceMappingURL=get-produto.use-case.js.map