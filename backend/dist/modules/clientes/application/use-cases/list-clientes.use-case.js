"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListClientesUseCase = void 0;
class ListClientesUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(input = {}) {
        const page = input.page ?? 1;
        const limit = input.limit ?? 20;
        return this.repo.findMany({ q: input.q, cidade: input.cidade, page, limit });
    }
}
exports.ListClientesUseCase = ListClientesUseCase;
//# sourceMappingURL=list-clientes.use-case.js.map