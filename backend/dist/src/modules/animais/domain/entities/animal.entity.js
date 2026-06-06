"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Animal = void 0;
const aggregate_root_base_js_1 = require("../../../../shared/domain/aggregate-root.base.js");
const validation_error_js_1 = require("../../../../shared/errors/validation.error.js");
const ESPECIES_VALIDAS = ['Cão', 'Gato'];
const SEXOS_VALIDOS = ['M', 'F', 'Indefinido'];
class Animal extends aggregate_root_base_js_1.AggregateRoot {
    static create(data) {
        if (!ESPECIES_VALIDAS.includes(data.especie)) {
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', `Espécie inválida: ${data.especie}. Use: ${ESPECIES_VALIDAS.join(', ')}`);
        }
        const sexo = (data.sexo ?? 'Indefinido');
        if (!SEXOS_VALIDOS.includes(sexo)) {
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', `Sexo inválido: ${data.sexo}. Use: ${SEXOS_VALIDOS.join(', ')}`);
        }
        return new Animal({
            nome: data.nome,
            clienteId: data.clienteId,
            especie: data.especie,
            raca: data.raca,
            sexo,
            nascimento: data.nascimento,
            peso: data.peso ?? 0,
            obs: data.obs,
            deletedAt: data.deletedAt,
        }, data.id);
    }
    get nome() { return this.props.nome; }
    get clienteId() { return this.props.clienteId; }
    get especie() { return this.props.especie; }
    get raca() { return this.props.raca; }
    get sexo() { return this.props.sexo; }
    get nascimento() { return this.props.nascimento; }
    get peso() { return this.props.peso; }
    get obs() { return this.props.obs; }
    get deletedAt() { return this.props.deletedAt; }
    get isActive() { return !this.props.deletedAt; }
    get idadeCalculada() {
        if (!this.props.nascimento)
            return null;
        const now = new Date();
        const born = this.props.nascimento;
        let anos = now.getFullYear() - born.getFullYear();
        let meses = now.getMonth() - born.getMonth();
        if (meses < 0) {
            anos -= 1;
            meses += 12;
        }
        if (now.getDate() < born.getDate()) {
            meses -= 1;
        }
        if (meses < 0) {
            anos -= 1;
            meses += 12;
        }
        return { anos, meses };
    }
    softDelete() {
        if (this.props.deletedAt)
            return;
        this.props.deletedAt = new Date();
    }
    update(fields) {
        if (fields.nome !== undefined)
            this.props.nome = fields.nome;
        if (fields.especie !== undefined) {
            if (!ESPECIES_VALIDAS.includes(fields.especie)) {
                throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', `Espécie inválida: ${fields.especie}`);
            }
            this.props.especie = fields.especie;
        }
        if (fields.sexo !== undefined) {
            if (!SEXOS_VALIDOS.includes(fields.sexo)) {
                throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', `Sexo inválido: ${fields.sexo}`);
            }
            this.props.sexo = fields.sexo;
        }
        if (fields.raca !== undefined)
            this.props.raca = fields.raca;
        if (fields.nascimento !== undefined)
            this.props.nascimento = fields.nascimento;
        if (fields.peso !== undefined)
            this.props.peso = fields.peso;
        if (fields.obs !== undefined)
            this.props.obs = fields.obs;
        this.updatedAt = new Date();
    }
}
exports.Animal = Animal;
//# sourceMappingURL=animal.entity.js.map