"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVendaUseCase = void 0;
const venda_entity_js_1 = require("../../domain/entities/venda.entity.js");
const not_found_error_js_1 = require("../../../../src/shared/errors/not-found.error.js");
class CreateVendaUseCase {
    vendaRepo;
    clienteRepo;
    constructor(vendaRepo, clienteRepo) {
        this.vendaRepo = vendaRepo;
        this.clienteRepo = clienteRepo;
    }
    async execute(input) {
        const cliente = await this.clienteRepo.findById(input.clienteId);
        if (!cliente)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Cliente não encontrado');
        const venda = venda_entity_js_1.Venda.create(input);
        await this.vendaRepo.save(venda);
        return venda;
    }
}
exports.CreateVendaUseCase = CreateVendaUseCase;
//# sourceMappingURL=create-venda.use-case.js.map