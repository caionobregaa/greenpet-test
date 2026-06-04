"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CPF = void 0;
const value_object_base_js_1 = require("../value-object.base.js");
class CPF extends value_object_base_js_1.ValueObject {
    get value() {
        return this.props.value;
    }
    static create(raw) {
        const digits = raw.replace(/\D/g, '');
        if (digits.length !== 11) {
            throw new Error('CPF deve conter 11 dígitos');
        }
        if (!CPF.isValid(digits)) {
            throw new Error('CPF inválido');
        }
        const formatted = CPF.format(digits);
        return new CPF({ value: formatted });
    }
    static isValid(digits) {
        if (/^(\d)\1{10}$/.test(digits))
            return false;
        const calc = (factor) => {
            let sum = 0;
            for (let i = 0; i < factor - 1; i++) {
                sum += parseInt(digits[i]) * (factor - i);
            }
            const remainder = (sum * 10) % 11;
            return remainder === 10 || remainder === 11 ? 0 : remainder;
        };
        return calc(10) === parseInt(digits[9]) && calc(11) === parseInt(digits[10]);
    }
    static format(digits) {
        return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
    }
    toString() {
        return this.props.value;
    }
}
exports.CPF = CPF;
//# sourceMappingURL=cpf.vo.js.map