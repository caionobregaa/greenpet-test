"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListOrcamentosUseCase = void 0;
class ListOrcamentosUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(params) {
        return this.repo.findMany({
            clienteId: params.clienteId,
            status: params.status,
            page: params.page ?? 1,
            limit: params.limit ?? 20,
        });
    }
}
exports.ListOrcamentosUseCase = ListOrcamentosUseCase;
//# sourceMappingURL=list-orcamentos.use-case.js.map