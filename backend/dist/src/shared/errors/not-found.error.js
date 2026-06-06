"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
const domain_error_js_1 = require("./domain-error.js");
class NotFoundError extends domain_error_js_1.DomainError {
    statusCode = 404;
}
exports.NotFoundError = NotFoundError;
//# sourceMappingURL=not-found.error.js.map