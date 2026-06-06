"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Phone = void 0;
const value_object_base_js_1 = require("../value-object.base.js");
const validation_error_js_1 = require("../../errors/validation.error.js");
const CELULAR = /^\(\d{2}\) \d \d{4}-\d{4}$/;
const FIXO = /^\(\d{2}\) \d{4}-\d{4}$/;
class Phone extends value_object_base_js_1.ValueObject {
    get value() {
        return this.props.value;
    }
    static create(raw) {
        const digits = raw.replace(/\D/g, '');
        let formatted = raw;
        if (digits.length === 11) {
            formatted = `(${digits.slice(0, 2)}) ${digits[2]} ${digits.slice(3, 7)}-${digits.slice(7)}`;
        }
        else if (digits.length === 10) {
            formatted = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
        }
        if (!CELULAR.test(formatted) && !FIXO.test(formatted)) {
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', 'Telefone inválido: use o formato (99) 9 9999-9999 ou (99) 9999-9999');
        }
        return new Phone({ value: formatted });
    }
    /** Reconstitui a partir do banco sem validação — aceita qualquer formato já armazenado. */
    static fromRaw(value) {
        return new Phone({ value: value.trim() });
    }
    toString() {
        return this.props.value;
    }
}
exports.Phone = Phone;
//# sourceMappingURL=phone.vo.js.map