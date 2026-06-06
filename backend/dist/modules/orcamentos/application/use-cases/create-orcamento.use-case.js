"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrcamentoUseCase = void 0;
const orcamento_entity_js_1 = require("../../domain/entities/orcamento.entity.js");
const not_found_error_js_1 = require("../../../../src/shared/errors/not-found.error.js");
class CreateOrcamentoUseCase {
    orcamentoRepo;
    clienteRepo;
    constructor(orcamentoRepo, clienteRepo) {
        this.orcamentoRepo = orcamentoRepo;
        this.clienteRepo = clienteRepo;
    }
    async execute(input) {
        if (input.clienteId) {
            const cliente = await this.clienteRepo.findById(input.clienteId);
            if (!cliente)
                throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Cliente não encontrado');
        }
        const orcamento = orcamento_entity_js_1.Orcamento.create(input);
        await this.orcamentoRepo.save(orcamento);
        return orcamento;
    }
}
exports.CreateOrcamentoUseCase = CreateOrcamentoUseCase;
//# sourceMappingURL=create-orcamento.use-case.js.map