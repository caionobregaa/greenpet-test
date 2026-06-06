"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Produto = void 0;
const aggregate_root_base_js_1 = require("../../../../shared/domain/aggregate-root.base.js");
const money_vo_js_1 = require("../../../../shared/domain/value-objects/money.vo.js");
const validation_error_js_1 = require("../../../../shared/errors/validation.error.js");
const CATEGORIAS_VALIDAS = ['Ração', 'Petisco', 'Medicamento', 'Acessório', 'Higiene', 'Serviço'];
class Produto extends aggregate_root_base_js_1.AggregateRoot {
    static create(data) {
        if (!CATEGORIAS_VALIDAS.includes(data.categoria)) {
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', `Categoria inválida: ${data.categoria}. Use: ${CATEGORIAS_VALIDAS.join(', ')}`);
        }
        return new Produto({
            nome: data.nome,
            categoria: data.categoria,
            especie: data.especie,
            subCategoria: data.subCategoria,
            marca: data.marca,
            fornecedor: data.fornecedor,
            pesoEmbalagem: data.pesoEmbalagem,
            valorCusto: money_vo_js_1.Money.create(data.valorCusto ?? 0),
            valorVenda: money_vo_js_1.Money.create(data.valorVenda),
            margemCartao: data.margemCartao ?? 0,
            margemImposto: data.margemImposto ?? 0,
            margemOperacao: data.margemOperacao ?? 0,
            margemLucro: data.margemLucro ?? 0,
            diasRecompra: data.diasRecompra,
            descricao: data.descricao,
            deletedAt: data.deletedAt,
        }, data.id);
    }
    get nome() { return this.props.nome; }
    get categoria() { return this.props.categoria; }
    get especie() { return this.props.especie; }
    get subCategoria() { return this.props.subCategoria; }
    get marca() { return this.props.marca; }
    get fornecedor() { return this.props.fornecedor; }
    get pesoEmbalagem() { return this.props.pesoEmbalagem; }
    get valorCusto() { return this.props.valorCusto.value; }
    get valorVenda() { return this.props.valorVenda.value; }
    get margemCartao() { return this.props.margemCartao; }
    get margemImposto() { return this.props.margemImposto; }
    get margemOperacao() { return this.props.margemOperacao; }
    get margemLucro() { return this.props.margemLucro; }
    get diasRecompra() { return this.props.diasRecompra; }
    get descricao() { return this.props.descricao; }
    get deletedAt() { return this.props.deletedAt; }
    get isActive() { return !this.props.deletedAt; }
    get margemCalculada() {
        const venda = this.props.valorVenda.value;
        if (venda === 0)
            return 0;
        const custo = this.props.valorCusto.value;
        return Math.round(((venda - custo) / venda) * 100 * 100) / 100;
    }
    softDelete() {
        if (this.props.deletedAt)
            return;
        this.props.deletedAt = new Date();
    }
    update(fields) {
        if (fields.nome !== undefined)
            this.props.nome = fields.nome;
        if (fields.categoria !== undefined) {
            if (!CATEGORIAS_VALIDAS.includes(fields.categoria)) {
                throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', `Categoria inválida: ${fields.categoria}`);
            }
            this.props.categoria = fields.categoria;
        }
        if (fields.valorCusto !== undefined)
            this.props.valorCusto = money_vo_js_1.Money.create(fields.valorCusto);
        if (fields.valorVenda !== undefined)
            this.props.valorVenda = money_vo_js_1.Money.create(fields.valorVenda);
        if (fields.especie !== undefined)
            this.props.especie = fields.especie;
        if (fields.subCategoria !== undefined)
            this.props.subCategoria = fields.subCategoria;
        if (fields.marca !== undefined)
            this.props.marca = fields.marca;
        if (fields.fornecedor !== undefined)
            this.props.fornecedor = fields.fornecedor;
        if (fields.pesoEmbalagem !== undefined)
            this.props.pesoEmbalagem = fields.pesoEmbalagem;
        if (fields.margemCartao !== undefined)
            this.props.margemCartao = fields.margemCartao;
        if (fields.margemImposto !== undefined)
            this.props.margemImposto = fields.margemImposto;
        if (fields.margemOperacao !== undefined)
            this.props.margemOperacao = fields.margemOperacao;
        if (fields.margemLucro !== undefined)
            this.props.margemLucro = fields.margemLucro;
        if (fields.diasRecompra !== undefined)
            this.props.diasRecompra = fields.diasRecompra;
        if (fields.descricao !== undefined)
            this.props.descricao = fields.descricao;
        this.updatedAt = new Date();
    }
}
exports.Produto = Produto;
//# sourceMappingURL=produto.entity.js.map