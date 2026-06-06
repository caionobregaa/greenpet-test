"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuthRoutes = registerAuthRoutes;
function registerAuthRoutes(app, controller) {
    app.post('/api/v1/auth/login', { config: { public: true } }, (req, rep) => controller.login(req, rep));
    app.post('/api/v1/auth/refresh', { config: { public: true } }, (req, rep) => controller.refresh(req, rep));
    app.post('/api/v1/auth/logout', (req, rep) => controller.logout(req, rep));
}
//# sourceMappingURL=auth.routes.js.map