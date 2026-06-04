"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cliente = void 0;
const aggregate_root_base_js_1 = require("@/shared/domain/aggregate-root.base.js");
const cpf_vo_js_1 = require("@/shared/domain/value-objects/cpf.vo.js");
const email_vo_js_1 = require("@/shared/domain/value-objects/email.vo.js");
const phone_vo_js_1 = require("@/shared/domain/value-objects/phone.vo.js");
const validation_error_js_1 = require("@/shared/errors/validation.error.js");
class Cliente extends aggregate_root_base_js_1.AggregateRoot {
    static create(data) {
        if (!data.nome || data.nome.trim().length < 3) {
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', 'Nome deve ter ao menos 3 caracteres');
        }
        return new Cliente({
            nome: data.nome.trim(),
            telefone: phone_vo_js_1.Phone.create(data.telefone),
            email: data.email ? email_vo_js_1.Email.create(data.email) : undefined,
            cpf: data.cpf ? cpf_vo_js_1.CPF.create(data.cpf) : undefined,
            endereco: data.endereco,
            bairro: data.bairro,
            cidade: data.cidade ?? 'Manaus',
            obs: data.obs,
            deletedAt: data.deletedAt,
            numeroDeAnimais: data.numeroDeAnimais,
        }, data.id);
    }
    get nome() { return this.props.nome; }
    get telefone() { return this.props.telefone.value; }
    get email() { return this.props.email?.value; }
    get cpf() { return this.props.cpf?.value; }
    get endereco() { return this.props.endereco; }
    get bairro() { return this.props.bairro; }
    get cidade() { return this.props.cidade; }
    get obs() { return this.props.obs; }
    get deletedAt() { return this.props.deletedAt; }
    get isActive() { return !this.props.deletedAt; }
    get numeroDeAnimais() { return this.props.numeroDeAnimais ?? 0; }
    update(fields) {
        if (fields.nome !== undefined) {
            if (fields.nome.trim().length < 3) {
                throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', 'Nome deve ter ao menos 3 caracteres');
            }
            this.props.nome = fields.nome.trim();
        }
        if (fields.telefone !== undefined)
            this.props.telefone = phone_vo_js_1.Phone.create(fields.telefone);
        if (fields.email !== undefined)
            this.props.email = email_vo_js_1.Email.create(fields.email);
        if (fields.cpf !== undefined)
            this.props.cpf = cpf_vo_js_1.CPF.create(fields.cpf);
        if (fields.endereco !== undefined)
            this.props.endereco = fields.endereco;
        if (fields.bairro !== undefined)
            this.props.bairro = fields.bairro;
        if (fields.cidade !== undefined)
            this.props.cidade = fields.cidade;
        if (fields.obs !== undefined)
            this.props.obs = fields.obs;
        this.updatedAt = new Date();
    }
    softDelete() {
        if (this.props.deletedAt)
            return;
        this.props.deletedAt = new Date();
    }
}
exports.Cliente = Cliente;
//# sourceMappingURL=cliente.entity.js.map