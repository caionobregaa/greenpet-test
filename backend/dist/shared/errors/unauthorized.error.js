"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnauthorizedError = void 0;
const domain_error_js_1 = require("./domain-error.js");
class UnauthorizedError extends domain_error_js_1.DomainError {
    statusCode = 401;
}
exports.UnauthorizedError = UnauthorizedError;
//# sourceMappingURL=unauthorized.error.js.map