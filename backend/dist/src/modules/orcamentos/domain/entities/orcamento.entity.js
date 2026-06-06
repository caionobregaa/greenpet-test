"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orcamento = void 0;
const aggregate_root_base_js_1 = require("../../../../shared/domain/aggregate-root.base.js");
const money_vo_js_1 = require("../../../../shared/domain/value-objects/money.vo.js");
const validation_error_js_1 = require("../../../../shared/errors/validation.error.js");
class Orcamento extends aggregate_root_base_js_1.AggregateRoot {
    static create(data) {
        const itens = data.itens.map((item) => ({
            id: item.id ?? crypto.randomUUID(),
            produtoId: item.produtoId,
            nome: item.nome,
            qtd: item.qtd,
            valorUnitario: item.valorUnitario,
            total: money_vo_js_1.Money.create(item.valorUnitario).multiply(item.qtd).value,
        }));
        const totalValue = itens.reduce((s, i) => s + i.total, 0);
        return new Orcamento({
            clienteId: data.clienteId,
            animalId: data.animalId,
            data: data.data ?? new Date(),
            validade: data.validade,
            status: data.status ?? 'pendente',
            total: money_vo_js_1.Money.create(totalValue),
            obs: data.obs,
            vendaId: data.vendaId,
            itens,
        }, data.id);
    }
    get clienteId() { return this.props.clienteId; }
    get animalId() { return this.props.animalId; }
    get data() { return this.props.data; }
    get validade() { return this.props.validade; }
    get status() { return this.props.status; }
    get total() { return this.props.total.value; }
    get obs() { return this.props.obs; }
    get vendaId() { return this.props.vendaId; }
    get itens() { return this.props.itens; }
    get vencido() {
        if (this.props.status !== 'pendente')
            return false;
        return this.props.validade < new Date();
    }
    aprovar() {
        if (this.props.status !== 'pendente') {
            throw new validation_error_js_1.ValidationError('INVALID_STATUS_TRANSITION', `Não é possível aprovar orçamento com status: ${this.props.status}`);
        }
        this.props.status = 'aprovado';
        this.updatedAt = new Date();
    }
    recusar() {
        if (this.props.status !== 'pendente') {
            throw new validation_error_js_1.ValidationError('INVALID_STATUS_TRANSITION', `Não é possível recusar orçamento com status: ${this.props.status}`);
        }
        this.props.status = 'recusado';
        this.updatedAt = new Date();
    }
    reabrir() {
        if (this.props.status !== 'recusado') {
            throw new validation_error_js_1.ValidationError('INVALID_STATUS_TRANSITION', `Não é possível reabrir orçamento com status: ${this.props.status}`);
        }
        this.props.status = 'pendente';
        this.updatedAt = new Date();
    }
    vincularVenda(vendaId) {
        this.props.vendaId = vendaId;
        this.props.status = 'aprovado';
        this.updatedAt = new Date();
    }
    update(fields) {
        if (this.props.status !== 'pendente') {
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', 'Apenas orçamentos pendentes podem ser editados');
        }
        if (fields.validade !== undefined)
            this.props.validade = fields.validade;
        if (fields.obs !== undefined)
            this.props.obs = fields.obs;
        if (fields.itens !== undefined) {
            this.props.itens = fields.itens.map((item) => ({
                id: item.id ?? crypto.randomUUID(),
                produtoId: item.produtoId,
                nome: item.nome,
                qtd: item.qtd,
                valorUnitario: item.valorUnitario,
                total: money_vo_js_1.Money.create(item.valorUnitario).multiply(item.qtd).value,
            }));
            this.props.total = money_vo_js_1.Money.create(this.props.itens.reduce((s, i) => s + i.total, 0));
        }
        this.updatedAt = new Date();
    }
}
exports.Orcamento = Orcamento;
//# sourceMappingURL=orcamento.entity.js.map