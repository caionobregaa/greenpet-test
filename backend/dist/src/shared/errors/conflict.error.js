"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = void 0;
const domain_error_js_1 = require("./domain-error.js");
class ConflictError extends domain_error_js_1.DomainError {
    statusCode = 409;
}
exports.ConflictError = ConflictError;
//# sourceMappingURL=conflict.error.js.map