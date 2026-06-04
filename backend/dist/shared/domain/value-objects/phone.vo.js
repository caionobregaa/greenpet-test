"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Phone = void 0;
const value_object_base_js_1 = require("../value-object.base.js");
const CELULAR = /^\(\d{2}\) \d \d{4}-\d{4}$/;
const FIXO = /^\(\d{2}\) \d{4}-\d{4}$/;
class Phone extends value_object_base_js_1.ValueObject {
    get value() {
        return this.props.value;
    }
    static create(raw) {
        if (!CELULAR.test(raw) && !FIXO.test(raw)) {
            throw new Error('Telefone inválido: use o formato (99) 9 9999-9999 ou (99) 9999-9999');
        }
        return new Phone({ value: raw });
    }
    toString() {
        return this.props.value;
    }
}
exports.Phone = Phone;
//# sourceMappingURL=phone.vo.js.map