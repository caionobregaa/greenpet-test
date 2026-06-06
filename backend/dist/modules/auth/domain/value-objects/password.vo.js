"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Password = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const validation_error_js_1 = require("../../../../src/shared/errors/validation.error.js");
class Password {
    _hash;
    constructor(_hash) {
        this._hash = _hash;
    }
    get hash() {
        return this._hash;
    }
    static validate(raw) {
        if (raw.length < 8) {
            throw new validation_error_js_1.ValidationError('WEAK_PASSWORD', 'Senha deve ter no mínimo 8 caracteres');
        }
        if (!/[a-zA-Z]/.test(raw)) {
            throw new validation_error_js_1.ValidationError('WEAK_PASSWORD', 'Senha deve conter pelo menos 1 letra');
        }
        if (!/\d/.test(raw)) {
            throw new validation_error_js_1.ValidationError('WEAK_PASSWORD', 'Senha deve conter pelo menos 1 número');
        }
    }
    static async hash(raw, rounds = 12) {
        Password.validate(raw);
        return bcryptjs_1.default.hash(raw, rounds);
    }
    static fromHash(hash) {
        return new Password(hash);
    }
    async compare(raw) {
        return bcryptjs_1.default.compare(raw, this._hash);
    }
}
exports.Password = Password;
//# sourceMappingURL=password.vo.js.map