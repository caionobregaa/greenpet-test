"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrcamentosRoutes = registerOrcamentosRoutes;
const prisma_orcamento_repository_js_1 = require("../repositories/prisma-orcamento.repository.js");
const prisma_venda_repository_js_1 = require("../../../../src/modules/vendas/infrastructure/repositories/prisma-venda.repository.js");
const prisma_cliente_repository_js_1 = require("../../../../src/modules/clientes/infrastructure/repositories/prisma-cliente.repository.js");
const create_orcamento_use_case_js_1 = require("../../application/use-cases/create-orcamento.use-case.js");
const get_orcamento_use_case_js_1 = require("../../application/use-cases/get-orcamento.use-case.js");
const list_orcamentos_use_case_js_1 = require("../../application/use-cases/list-orcamentos.use-case.js");
const update_orcamento_status_use_case_js_1 = require("../../application/use-cases/update-orcamento-status.use-case.js");
const converter_orcamento_use_case_js_1 = require("../../application/use-cases/converter-orcamento.use-case.js");
const delete_orcamento_use_case_js_1 = require("../../application/use-cases/delete-orcamento.use-case.js");
const update_orcamento_use_case_js_1 = require("../../application/use-cases/update-orcamento.use-case.js");
const orcamentos_schema_js_1 = require("./orcamentos.schema.js");
const validation_error_js_1 = require("../../../../src/shared/errors/validation.error.js");
function toResponse(o, extra) {
    return {
        id: o.id,
        clienteId: o.clienteId,
        animalId: o.animalId,
        data: o.data,
        validade: o.validade,
        status: o.status,
        vencido: o.vencido,
        total: o.total,
        obs: o.obs,
        vendaId: o.vendaId,
        itens: o.itens,
        cliente: extra?.clienteNome ? { nome: extra.clienteNome } : undefined,
        animal: extra?.animalNome ? { nome: extra.animalNome } : undefined,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
    };
}
function registerOrcamentosRoutes(app, prisma) {
    const orcamentoRepo = new prisma_orcamento_repository_js_1.PrismaOrcamentoRepository(prisma);
    const vendaRepo = new prisma_venda_repository_js_1.PrismaVendaRepository(prisma);
    const clienteRepo = new prisma_cliente_repository_js_1.PrismaClienteRepository(prisma);
    const createUC = new create_orcamento_use_case_js_1.CreateOrcamentoUseCase(orcamentoRepo, clienteRepo);
    const getUC = new get_orcamento_use_case_js_1.GetOrcamentoUseCase(orcamentoRepo);
    const listUC = new list_orcamentos_use_case_js_1.ListOrcamentosUseCase(orcamentoRepo);
    const statusUC = new update_orcamento_status_use_case_js_1.UpdateOrcamentoStatusUseCase(orcamentoRepo);
    const converterUC = new converter_orcamento_use_case_js_1.ConverterOrcamentoUseCase(orcamentoRepo, vendaRepo);
    const deleteUC = new delete_orcamento_use_case_js_1.DeleteOrcamentoUseCase(orcamentoRepo);
    const updateUC = new update_orcamento_use_case_js_1.UpdateOrcamentoUseCase(orcamentoRepo);
    app.get('/api/v1/orcamentos', async (req, rep) => {
        const q = orcamentos_schema_js_1.ListOrcamentosQuerySchema.safeParse(req.query);
        if (!q.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', q.error.errors[0].message);
        const result = await listUC.execute(q.data);
        // Fetch cliente/animal data in one batch query
        const ids = result.orcamentos.map((o) => o.id);
        const rows = await prisma.orcamento.findMany({
            where: { id: { in: ids } },
            select: {
                id: true,
                cliente: { select: { nome: true } },
                animal: { select: { nome: true } },
            },
        });
        const extraMap = new Map(rows.map((r) => [r.id, { clienteNome: r.cliente?.nome, animalNome: r.animal?.nome }]));
        rep.send({
            data: result.orcamentos.map((o) => toResponse(o, extraMap.get(o.id))),
            meta: { page: q.data.page, limit: q.data.limit, total: result.total },
        });
    });
    app.post('/api/v1/orcamentos', async (req, rep) => {
        const body = orcamentos_schema_js_1.CreateOrcamentoSchema.safeParse(req.body);
        if (!body.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', body.error.errors[0].message);
        const o = await createUC.execute(body.data);
        rep.status(201).send({ data: toResponse(o) });
    });
    app.get('/api/v1/orcamentos/:id', async (req, rep) => {
        const { id } = req.params;
        const o = await getUC.execute({ id });
        const row = await prisma.orcamento.findUnique({
            where: { id },
            select: {
                cliente: { select: { nome: true } },
                animal: { select: { nome: true } },
            },
        });
        rep.send({ data: toResponse(o, { clienteNome: row?.cliente?.nome, animalNome: row?.animal?.nome }) });
    });
    app.patch('/api/v1/orcamentos/:id/status', async (req, rep) => {
        const { id } = req.params;
        const body = orcamentos_schema_js_1.UpdateOrcamentoStatusSchema.safeParse(req.body);
        if (!body.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', body.error.errors[0].message);
        const o = await statusUC.execute({ id, acao: body.data.acao });
        rep.send({ data: toResponse(o) });
    });
    app.post('/api/v1/orcamentos/:id/converter', async (req, rep) => {
        const { id } = req.params;
        const body = orcamentos_schema_js_1.ConverterOrcamentoSchema.safeParse(req.body);
        if (!body.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', body.error.errors[0].message);
        const venda = await converterUC.execute({ id, formaPag: body.data.formaPag });
        rep.status(201).send({ data: { vendaId: venda.id } });
    });
    app.put('/api/v1/orcamentos/:id', async (req, rep) => {
        const { id } = req.params;
        const body = orcamentos_schema_js_1.UpdateOrcamentoSchema.safeParse(req.body);
        if (!body.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', body.error.errors[0].message);
        const o = await updateUC.execute({ id, ...body.data });
        rep.send({ data: toResponse(o) });
    });
    app.delete('/api/v1/orcamentos/:id', async (req, rep) => {
        const { id } = req.params;
        await deleteUC.execute({ id });
        rep.status(204).send();
    });
}
//# sourceMappingURL=orcamentos.routes.js.map