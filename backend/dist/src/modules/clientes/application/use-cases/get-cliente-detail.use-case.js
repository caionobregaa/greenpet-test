"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetClienteDetailUseCase = void 0;
const not_found_error_js_1 = require("../../../../shared/errors/not-found.error.js");
class GetClienteDetailUseCase {
    clienteRepo;
    animalRepo;
    vendaRepo;
    constructor(clienteRepo, animalRepo, vendaRepo) {
        this.clienteRepo = clienteRepo;
        this.animalRepo = animalRepo;
        this.vendaRepo = vendaRepo;
    }
    async execute({ id }) {
        const cliente = await this.clienteRepo.findById(id);
        if (!cliente)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Cliente não encontrado');
        const [{ animais }, { vendas }] = await Promise.all([
            this.animalRepo.findMany({ clienteId: id, page: 1, limit: 1000 }),
            this.vendaRepo.findMany({ clienteId: id, page: 1, limit: 1000 }),
        ]);
        return { cliente, animais, vendas };
    }
}
exports.GetClienteDetailUseCase = GetClienteDetailUseCase;
//# sourceMappingURL=get-cliente-detail.use-case.js.map