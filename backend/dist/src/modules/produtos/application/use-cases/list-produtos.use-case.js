"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListProdutosUseCase = void 0;
class ListProdutosUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(params) {
        return this.repo.findMany({
            q: params.q,
            categoria: params.categoria,
            especie: params.especie,
            page: params.page ?? 1,
            limit: params.limit ?? 20,
        });
    }
}
exports.ListProdutosUseCase = ListProdutosUseCase;
//# sourceMappingURL=list-produtos.use-case.js.map