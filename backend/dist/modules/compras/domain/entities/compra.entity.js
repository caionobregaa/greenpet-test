"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Compra = void 0;
const aggregate_root_base_js_1 = require("../../../../src/shared/domain/aggregate-root.base.js");
const money_vo_js_1 = require("../../../../src/shared/domain/value-objects/money.vo.js");
const validation_error_js_1 = require("../../../../src/shared/errors/validation.error.js");
class Compra extends aggregate_root_base_js_1.AggregateRoot {
    static create(data) {
        const itens = data.itens.map((item) => ({
            id: item.id ?? crypto.randomUUID(),
            produtoId: item.produtoId,
            nome: item.nome,
            qtd: item.qtd,
            valorUnitario: item.valorUnitario,
            total: money_vo_js_1.Money.create(item.valorUnitario).multiply(item.qtd).value,
        }));
        const totalValue = itens.length > 0
            ? itens.reduce((s, i) => s + i.total, 0)
            : (data.totalManual ?? 0);
        return new Compra({
            fornecedor: data.fornecedor,
            dataPedido: data.dataPedido ?? new Date(),
            dataRecebimento: data.dataRecebimento,
            categoria: data.categoria ?? 'Produtos Pets',
            descricaoSimples: data.descricaoSimples,
            status: data.status ?? 'pendente',
            total: money_vo_js_1.Money.create(totalValue),
            obs: data.obs,
            itens,
        }, data.id);
    }
    get fornecedor() { return this.props.fornecedor; }
    get dataPedido() { return this.props.dataPedido; }
    get dataRecebimento() { return this.props.dataRecebimento; }
    get categoria() { return this.props.categoria; }
    get descricaoSimples() { return this.props.descricaoSimples; }
    get status() { return this.props.status; }
    get total() { return this.props.total.value; }
    get obs() { return this.props.obs; }
    get itens() { return this.props.itens; }
    assertEditavel() {
        if (this.props.status === 'confirmado' || this.props.status === 'recebido' || this.props.status === 'cancelado') {
            throw new validation_error_js_1.ValidationError('CANNOT_EDIT', `Compra com status '${this.props.status}' não pode ser editada`);
        }
    }
    confirmar() {
        if (this.props.status !== 'pendente') {
            throw new validation_error_js_1.ValidationError('INVALID_STATUS_TRANSITION', `Não é possível confirmar compra com status: ${this.props.status}`);
        }
        this.props.status = 'confirmado';
        this.updatedAt = new Date();
    }
    receber() {
        if (this.props.status !== 'confirmado') {
            throw new validation_error_js_1.ValidationError('INVALID_STATUS_TRANSITION', `Não é possível receber compra com status: ${this.props.status}`);
        }
        this.props.status = 'recebido';
        this.props.dataRecebimento = new Date();
        this.updatedAt = new Date();
    }
    cancelar() {
        if (this.props.status !== 'pendente') {
            throw new validation_error_js_1.ValidationError('INVALID_STATUS_TRANSITION', `Não é possível cancelar compra com status: ${this.props.status}`);
        }
        this.props.status = 'cancelado';
        this.updatedAt = new Date();
    }
    update(fields) {
        this.assertEditavel();
        if (fields.fornecedor !== undefined)
            this.props.fornecedor = fields.fornecedor;
        if (fields.obs !== undefined)
            this.props.obs = fields.obs;
        if (fields.dataPedido !== undefined)
            this.props.dataPedido = fields.dataPedido;
        if (fields.categoria !== undefined)
            this.props.categoria = fields.categoria;
        if (fields.descricaoSimples !== undefined)
            this.props.descricaoSimples = fields.descricaoSimples;
        if (fields.totalManual !== undefined && (fields.itens === undefined || fields.itens.length === 0)) {
            this.props.total = money_vo_js_1.Money.create(fields.totalManual);
        }
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
exports.Compra = Compra;
//# sourceMappingURL=compra.entity.js.map