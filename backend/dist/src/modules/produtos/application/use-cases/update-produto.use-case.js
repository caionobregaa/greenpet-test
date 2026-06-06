"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProdutoUseCase = void 0;
const not_found_error_js_1 = require("../../../../shared/errors/not-found.error.js");
const conflict_error_js_1 = require("../../../../shared/errors/conflict.error.js");
class UpdateProdutoUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(input) {
        const { id, ...fields } = input;
        const produto = await this.repo.findById(id);
        if (!produto)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Produto não encontrado');
        if (fields.nome && fields.nome !== produto.nome) {
            const conflict = await this.repo.findByNome(fields.nome);
            if (conflict)
                throw new conflict_error_js_1.ConflictError('NOME_ALREADY_EXISTS', 'Produto com este nome já existe');
        }
        produto.update(fields);
        await this.repo.save(produto);
        return produto;
    }
}
exports.UpdateProdutoUseCase = UpdateProdutoUseCase;
//# sourceMappingURL=update-produto.use-case.js.map