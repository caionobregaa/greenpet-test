"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRecompraRoutes = registerRecompraRoutes;
const prisma_recompra_repository_js_1 = require("../repositories/prisma-recompra.repository.js");
const list_recompra_alertas_use_case_js_1 = require("../../application/use-cases/list-recompra-alertas.use-case.js");
const zod_1 = require("zod");
const validation_error_js_1 = require("../../../../shared/errors/validation.error.js");
const QuerySchema = zod_1.z.object({
    clienteId: zod_1.z.string().uuid().optional(),
    urgencia: zod_1.z.enum(['vencido', 'urgente', 'proximo', 'ok']).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
function registerRecompraRoutes(app, prisma) {
    const repo = new prisma_recompra_repository_js_1.PrismaRecompraRepository(prisma);
    const listUC = new list_recompra_alertas_use_case_js_1.ListRecompraAlertasUseCase(repo);
    app.get('/api/v1/recompra', async (req, rep) => {
        const q = QuerySchema.safeParse(req.query);
        if (!q.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', q.error.errors[0].message);
        const result = await listUC.execute(q.data);
        rep.send({
            data: result.alertas,
            meta: { page: q.data.page, limit: q.data.limit, total: result.total },
        });
    });
}
//# sourceMappingURL=recompra.routes.js.map