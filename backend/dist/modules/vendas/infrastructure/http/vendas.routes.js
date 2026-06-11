"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVendasRoutes = registerVendasRoutes;
const prisma_venda_repository_js_1 = require("../repositories/prisma-venda.repository.js");
const prisma_cliente_repository_js_1 = require("../../../../src/modules/clientes/infrastructure/repositories/prisma-cliente.repository.js");
const create_venda_use_case_js_1 = require("../../application/use-cases/create-venda.use-case.js");
const get_venda_use_case_js_1 = require("../../application/use-cases/get-venda.use-case.js");
const list_vendas_use_case_js_1 = require("../../application/use-cases/list-vendas.use-case.js");
const delete_venda_use_case_js_1 = require("../../application/use-cases/delete-venda.use-case.js");
const vendas_schema_js_1 = require("./vendas.schema.js");
const validation_error_js_1 = require("../../../../src/shared/errors/validation.error.js");
function toResponse(v, extra) {
    return {
        id: v.id,
        clienteId: v.clienteId,
        animalId: v.animalId,
        data: v.data,
        formaPag: v.formaPag,
        taxaCartao: v.taxaCartao,
        total: v.total,
        obs: v.obs,
        itens: v.itens,
        cliente: extra?.clienteNome ? { nome: extra.clienteNome } : undefined,
        animal: extra?.animalNome ? { nome: extra.animalNome } : undefined,
        createdAt: v.createdAt,
    };
}
function registerVendasRoutes(app, prisma) {
    const vendaRepo = new prisma_venda_repository_js_1.PrismaVendaRepository(prisma);
    const clienteRepo = new prisma_cliente_repository_js_1.PrismaClienteRepository(prisma);
    const createUC = new create_venda_use_case_js_1.CreateVendaUseCase(vendaRepo, clienteRepo);
    const getUC = new get_venda_use_case_js_1.GetVendaUseCase(vendaRepo);
    const listUC = new list_vendas_use_case_js_1.ListVendasUseCase(vendaRepo);
    const deleteUC = new delete_venda_use_case_js_1.DeleteVendaUseCase(vendaRepo);
    app.get('/api/v1/vendas', async (req, rep) => {
        const q = vendas_schema_js_1.ListVendasQuerySchema.safeParse(req.query);
        if (!q.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', q.error.errors[0].message);
        const result = await listUC.execute(q.data);
        const ids = result.vendas.map((v) => v.id);
        const rows = await prisma.venda.findMany({
            where: { id: { in: ids } },
            select: {
                id: true,
                cliente: { select: { nome: true } },
                animal: { select: { nome: true } },
            },
        });
        const extraMap = new Map(rows.map((r) => [r.id, { clienteNome: r.cliente?.nome, animalNome: r.animal?.nome }]));
        rep.send({
            data: result.vendas.map((v) => toResponse(v, extraMap.get(v.id))),
            meta: { page: q.data.page, limit: q.data.limit, total: result.total },
        });
    });
    app.post('/api/v1/vendas', async (req, rep) => {
        const body = vendas_schema_js_1.CreateVendaSchema.safeParse(req.body);
        if (!body.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', body.error.errors[0].message);
        const venda = await createUC.execute(body.data);
        rep.status(201).send({ data: toResponse(venda) });
    });
    app.get('/api/v1/vendas/:id', async (req, rep) => {
        const { id } = req.params;
        const venda = await getUC.execute({ id });
        const row = await prisma.venda.findUnique({
            where: { id },
            select: {
                cliente: { select: { nome: true } },
                animal: { select: { nome: true } },
            },
        });
        rep.send({ data: toResponse(venda, { clienteNome: row?.cliente?.nome, animalNome: row?.animal?.nome }) });
    });
    app.delete('/api/v1/vendas/:id', async (req, rep) => {
        const { id } = req.params;
        await deleteUC.execute({ id });
        rep.status(204).send();
    });
}
//# sourceMappingURL=vendas.routes.js.map