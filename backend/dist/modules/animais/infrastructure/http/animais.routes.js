"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAnimaisRoutes = registerAnimaisRoutes;
function registerAnimaisRoutes(app, controller) {
    app.get('/api/v1/animais', (req, rep) => controller.list(req, rep));
    app.post('/api/v1/animais', (req, rep) => controller.create(req, rep));
    app.get('/api/v1/animais/:id', (req, rep) => controller.getOne(req, rep));
    app.put('/api/v1/animais/:id', (req, rep) => controller.update(req, rep));
    app.delete('/api/v1/animais/:id', (req, rep) => controller.delete(req, rep));
}
//# sourceMappingURL=animais.routes.js.map