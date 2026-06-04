"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListAnimaisUseCase = void 0;
class ListAnimaisUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(params) {
        return this.repo.findMany({
            clienteId: params.clienteId,
            page: params.page ?? 1,
            limit: params.limit ?? 20,
        });
    }
}
exports.ListAnimaisUseCase = ListAnimaisUseCase;
//# sourceMappingURL=list-animais.use-case.js.map