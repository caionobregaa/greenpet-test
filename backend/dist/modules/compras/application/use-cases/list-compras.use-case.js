"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListComprasUseCase = void 0;
class ListComprasUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(params) {
        return this.repo.findMany({
            status: params.status,
            fornecedor: params.fornecedor,
            page: params.page ?? 1,
            limit: params.limit ?? 20,
        });
    }
}
exports.ListComprasUseCase = ListComprasUseCase;
//# sourceMappingURL=list-compras.use-case.js.map