"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_schema_js_1 = require("./auth.schema.js");
const validation_error_js_1 = require("@/shared/errors/validation.error.js");
class AuthController {
    loginUseCase;
    refreshTokenUseCase;
    logoutUseCase;
    constructor(loginUseCase, refreshTokenUseCase, logoutUseCase) {
        this.loginUseCase = loginUseCase;
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.logoutUseCase = logoutUseCase;
    }
    async login(request, reply) {
        const body = auth_schema_js_1.LoginBodySchema.safeParse(request.body);
        if (!body.success) {
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', body.error.errors[0].message);
        }
        const result = await this.loginUseCase.execute(body.data);
        reply.status(200).send({ data: result });
    }
    async refresh(request, reply) {
        const body = auth_schema_js_1.RefreshBodySchema.safeParse(request.body);
        if (!body.success) {
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', body.error.errors[0].message);
        }
        const result = await this.refreshTokenUseCase.execute(body.data.refreshToken);
        reply.status(200).send({ data: result });
    }
    async logout(request, reply) {
        const user = request.user;
        await this.logoutUseCase.execute(user.sub);
        reply.status(204).send();
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map