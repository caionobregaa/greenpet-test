"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Venda = void 0;
const aggregate_root_base_js_1 = require("../../../../src/shared/domain/aggregate-root.base.js");
const money_vo_js_1 = require("../../../../src/shared/domain/value-objects/money.vo.js");
const validation_error_js_1 = require("../../../../src/shared/errors/validation.error.js");
const FORMAS_PAGAMENTO = ['Pix', 'Dinheiro', 'Cartão Crédito', 'Cartão Débito', 'Boleto'];
class Venda extends aggregate_root_base_js_1.AggregateRoot {
    static create(data) {
        if (!FORMAS_PAGAMENTO.includes(data.formaPag)) {
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', `Forma de pagamento inválida: ${data.formaPag}. Use: ${FORMAS_PAGAMENTO.join(', ')}`);
        }
        if (!data.itens || data.itens.length === 0) {
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', 'Venda deve ter ao menos 1 item');
        }
        const itens = data.itens.map((item) => {
            if (item.qtd <= 0) {
                throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', 'Quantidade deve ser maior que zero');
            }
            const itemTotal = money_vo_js_1.Money.create(item.valorUnitario).multiply(item.qtd).value;
            return {
                id: item.id ?? crypto.randomUUID(),
                produtoId: item.produtoId,
                nome: item.nome,
                qtd: item.qtd,
                valorUnitario: item.valorUnitario,
                total: itemTotal,
            };
        });
        const totalValue = itens.reduce((sum, i) => sum + i.total, 0);
        return new Venda({
            clienteId: data.clienteId,
            animalId: data.animalId,
            data: data.data ?? new Date(),
            formaPag: data.formaPag,
            total: money_vo_js_1.Money.create(totalValue),
            obs: data.obs,
            itens,
        }, data.id);
    }
    get clienteId() { return this.props.clienteId; }
    get animalId() { return this.props.animalId; }
    get data() { return this.props.data; }
    get formaPag() { return this.props.formaPag; }
    get total() { return this.props.total.value; }
    get obs() { return this.props.obs; }
    get itens() { return this.props.itens; }
}
exports.Venda = Venda;
//# sourceMappingURL=venda.entity.js.map