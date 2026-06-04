"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
const domain_error_js_1 = require("./domain-error.js");
class ValidationError extends domain_error_js_1.DomainError {
    statusCode = 400;
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=validation.error.js.map