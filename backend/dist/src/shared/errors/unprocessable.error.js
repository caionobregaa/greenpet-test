"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnprocessableError = void 0;
const domain_error_js_1 = require("./domain-error.js");
class UnprocessableError extends domain_error_js_1.DomainError {
    statusCode = 422;
}
exports.UnprocessableError = UnprocessableError;
//# sourceMappingURL=unprocessable.error.js.map