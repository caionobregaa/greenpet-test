"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListRecompraAlertasUseCase = void 0;
class ListRecompraAlertasUseCase {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async execute(params) {
        return this.repo.findAlertas({
            clienteId: params.clienteId,
            urgencia: params.urgencia,
            page: params.page ?? 1,
            limit: params.limit ?? 20,
        });
    }
}
exports.ListRecompraAlertasUseCase = ListRecompraAlertasUseCase;
//# sourceMappingURL=list-recompra-alertas.use-case.js.map