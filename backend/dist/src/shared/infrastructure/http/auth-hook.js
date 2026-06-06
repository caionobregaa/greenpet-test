"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuthHook = registerAuthHook;
const unauthorized_error_js_1 = require("../../errors/unauthorized.error.js");
function registerAuthHook(app) {
    app.addHook('onRequest', async (request, _reply) => {
        const routeConfig = request.routeOptions.config;
        if (routeConfig?.public === true)
            return;
        try {
            await request.jwtVerify();
        }
        catch {
            throw new unauthorized_error_js_1.UnauthorizedError('UNAUTHORIZED', 'Token inválido ou ausente');
        }
    });
}
//# sourceMappingURL=auth-hook.js.map