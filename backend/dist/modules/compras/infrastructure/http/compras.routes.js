"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerComprasRoutes = registerComprasRoutes;
const prisma_compra_repository_js_1 = require("../repositories/prisma-compra.repository.js");
const create_compra_use_case_js_1 = require("../../application/use-cases/create-compra.use-case.js");
const get_compra_use_case_js_1 = require("../../application/use-cases/get-compra.use-case.js");
const list_compras_use_case_js_1 = require("../../application/use-cases/list-compras.use-case.js");
const update_compra_use_case_js_1 = require("../../application/use-cases/update-compra.use-case.js");
const update_compra_status_use_case_js_1 = require("../../application/use-cases/update-compra-status.use-case.js");
const delete_compra_use_case_js_1 = require("../../application/use-cases/delete-compra.use-case.js");
const compras_schema_js_1 = require("./compras.schema.js");
const validation_error_js_1 = require("../../../../src/shared/errors/validation.error.js");
function toResponse(c) {
    return {
        id: c.id,
        fornecedor: c.fornecedor,
        dataPedido: c.dataPedido,
        dataRecebimento: c.dataRecebimento,
        categoria: c.categoria,
        descricaoSimples: c.descricaoSimples,
        formaPag: c.formaPag ?? null,
        status: c.status,
        total: c.total,
        obs: c.obs,
        itens: c.itens.map((i) => ({ ...i, pesoKg: i.pesoKg ?? null })),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
    };
}
async function autoImportarEstoque(prisma, compra) {
    if (compra.categoria !== 'Produtos Pets' || compra.itens.length === 0)
        return;
    await Promise.all(compra.itens
        .filter((i) => i.produtoId)
        .map((i) => prisma.estoqueItem.create({
        data: {
            id: crypto.randomUUID(),
            produtoId: i.produtoId,
            quantidade: i.qtd,
            validade: null,
            lote: null,
            obs: `Importado da despesa`,
        },
    })));
}
function registerComprasRoutes(app, prisma) {
    const repo = new prisma_compra_repository_js_1.PrismaCompraRepository(prisma);
    const createUC = new create_compra_use_case_js_1.CreateCompraUseCase(repo);
    const getUC = new get_compra_use_case_js_1.GetCompraUseCase(repo);
    const listUC = new list_compras_use_case_js_1.ListComprasUseCase(repo);
    const updateUC = new update_compra_use_case_js_1.UpdateCompraUseCase(repo);
    const statusUC = new update_compra_status_use_case_js_1.UpdateCompraStatusUseCase(repo);
    const deleteUC = new delete_compra_use_case_js_1.DeleteCompraUseCase(repo);
    app.get('/api/v1/compras', async (req, rep) => {
        const q = compras_schema_js_1.ListComprasQuerySchema.safeParse(req.query);
        if (!q.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', q.error.errors[0].message);
        const result = await listUC.execute(q.data);
        rep.send({ data: result.compras.map(toResponse), meta: { page: q.data.page, limit: q.data.limit, total: result.total } });
    });
    app.post('/api/v1/compras', async (req, rep) => {
        const body = compras_schema_js_1.CreateCompraSchema.safeParse(req.body);
        if (!body.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', body.error.errors[0].message);
        const compra = await createUC.execute(body.data);
        rep.status(201).send({ data: toResponse(compra) });
    });
    app.post('/api/v1/compras/:id/importar-estoque', async (req, rep) => {
        const { id } = req.params;
        const compra = await getUC.execute({ id });
        const itens = compra.itens.filter((i) => i.produtoId);
        if (itens.length === 0) {
            rep.send({ data: { importados: 0 } });
            return;
        }
        await Promise.all(itens.map((i) => prisma.estoqueItem.create({
            data: {
                id: crypto.randomUUID(),
                produtoId: i.produtoId,
                quantidade: i.qtd,
                validade: null,
                lote: null,
                obs: `Importado da despesa`,
            },
        })));
        rep.send({ data: { importados: itens.length } });
    });
    app.get('/api/v1/compras/:id', async (req, rep) => {
        const { id } = req.params;
        const compra = await getUC.execute({ id });
        rep.send({ data: toResponse(compra) });
    });
    app.put('/api/v1/compras/:id', async (req, rep) => {
        const { id } = req.params;
        const body = compras_schema_js_1.UpdateCompraSchema.safeParse(req.body);
        if (!body.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', body.error.errors[0].message);
        const compra = await updateUC.execute({ id, ...body.data });
        rep.send({ data: toResponse(compra) });
    });
    app.patch('/api/v1/compras/:id/status', async (req, rep) => {
        const { id } = req.params;
        const body = compras_schema_js_1.UpdateCompraStatusSchema.safeParse(req.body);
        if (!body.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', body.error.errors[0].message);
        const compra = await statusUC.execute({ id, acao: body.data.acao });
        rep.send({ data: toResponse(compra) });
    });
    app.delete('/api/v1/compras/:id', async (req, rep) => {
        const { id } = req.params;
        await deleteUC.execute({ id });
        rep.status(204).send();
    });
}
//# sourceMappingURL=compras.routes.js.map