"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConverterOrcamentoUseCase = void 0;
const venda_entity_js_1 = require("../../../../src/modules/vendas/domain/entities/venda.entity.js");
const not_found_error_js_1 = require("../../../../src/shared/errors/not-found.error.js");
const unprocessable_error_js_1 = require("../../../../src/shared/errors/unprocessable.error.js");
class ConverterOrcamentoUseCase {
    orcamentoRepo;
    vendaRepo;
    constructor(orcamentoRepo, vendaRepo) {
        this.orcamentoRepo = orcamentoRepo;
        this.vendaRepo = vendaRepo;
    }
    async execute({ id, formaPag }) {
        const orcamento = await this.orcamentoRepo.findById(id);
        if (!orcamento)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Orçamento não encontrado');
        if (orcamento.status === 'aprovado' && orcamento.vendaId) {
            throw new unprocessable_error_js_1.UnprocessableError('ALREADY_CONVERTED', 'Orçamento já foi convertido em venda');
        }
        if (orcamento.status === 'recusado') {
            throw new unprocessable_error_js_1.UnprocessableError('INVALID_STATUS', 'Orçamento recusado não pode ser convertido');
        }
        const clienteId = orcamento.clienteId;
        if (!clienteId) {
            throw new unprocessable_error_js_1.UnprocessableError('MISSING_CLIENTE', 'Orçamento sem cliente não pode ser convertido em venda');
        }
        const venda = venda_entity_js_1.Venda.create({
            clienteId,
            animalId: orcamento.animalId,
            data: new Date(),
            formaPag,
            obs: orcamento.obs,
            itens: orcamento.itens.map((i) => ({
                produtoId: i.produtoId,
                nome: i.nome,
                qtd: i.qtd,
                valorUnitario: i.valorUnitario,
            })),
        });
        await this.vendaRepo.save(venda);
        orcamento.vincularVenda(venda.id);
        await this.orcamentoRepo.save(orcamento);
        return venda;
    }
}
exports.ConverterOrcamentoUseCase = ConverterOrcamentoUseCase;
//# sourceMappingURL=converter-orcamento.use-case.js.map