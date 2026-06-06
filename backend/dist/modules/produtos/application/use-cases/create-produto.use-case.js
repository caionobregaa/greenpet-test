"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProdutoUseCase = void 0;
const produto_entity_js_1 = require("../../domain/entities/produto.entity.js");
const conflict_error_js_1 = require("../../../../src/shared/errors/conflict.error.js");
class CreateProdutoUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(input) {
        const existing = await this.repo.findByNome(input.nome);
        if (existing)
            throw new conflict_error_js_1.ConflictError('NOME_ALREADY_EXISTS', 'Produto com este nome já existe');
        const produto = produto_entity_js_1.Produto.create(input);
        await this.repo.save(produto);
        return produto;
    }
}
exports.CreateProdutoUseCase = CreateProdutoUseCase;
//# sourceMappingURL=create-produto.use-case.js.map