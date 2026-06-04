"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainError = void 0;
class DomainError extends Error {
    code;
    fields;
    constructor(code, message, fields) {
        super(message);
        this.code = code;
        this.fields = fields;
        this.name = this.constructor.name;
    }
}
exports.DomainError = DomainError;
//# sourceMappingURL=domain-error.js.map