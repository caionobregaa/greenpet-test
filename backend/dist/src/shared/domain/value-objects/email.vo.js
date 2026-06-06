"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Email = void 0;
const value_object_base_js_1 = require("../value-object.base.js");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
class Email extends value_object_base_js_1.ValueObject {
    get value() {
        return this.props.value;
    }
    static create(raw) {
        const trimmed = raw.trim().toLowerCase();
        if (!EMAIL_REGEX.test(trimmed)) {
            throw new Error(`E-mail inválido: ${raw}`);
        }
        return new Email({ value: trimmed });
    }
    toString() {
        return this.props.value;
    }
}
exports.Email = Email;
//# sourceMappingURL=email.vo.js.map