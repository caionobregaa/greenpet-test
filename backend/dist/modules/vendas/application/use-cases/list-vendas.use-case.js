"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListVendasUseCase = void 0;
class ListVendasUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(params) {
        return this.repo.findMany({
            clienteId: params.clienteId,
            animalId: params.animalId,
            page: params.page ?? 1,
            limit: params.limit ?? 20,
        });
    }
}
exports.ListVendasUseCase = ListVendasUseCase;
//# sourceMappingURL=list-vendas.use-case.js.map