"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDashboardRoutes = registerDashboardRoutes;
const prisma_dashboard_repository_js_1 = require("../repositories/prisma-dashboard.repository.js");
const zod_1 = require("zod");
const validation_error_js_1 = require("../../../../shared/errors/validation.error.js");
const QuerySchema = zod_1.z.object({
    inicio: zod_1.z.string().date().default(() => {
        const d = new Date();
        d.setDate(1);
        return d.toISOString().slice(0, 10);
    }),
    fim: zod_1.z.string().date().default(() => new Date().toISOString().slice(0, 10)),
});
function registerDashboardRoutes(app, prisma) {
    const repo = new prisma_dashboard_repository_js_1.PrismaDashboardRepository(prisma);
    app.get('/api/v1/dashboard', async (req, rep) => {
        const q = QuerySchema.safeParse(req.query);
        if (!q.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', q.error.errors[0].message);
        const kpis = await repo.getKPIs({
            inicio: new Date(q.data.inicio),
            fim: new Date(q.data.fim + 'T23:59:59.999Z'),
        });
        rep.send({ data: kpis });
    });
}
//# sourceMappingURL=dashboard.routes.js.map