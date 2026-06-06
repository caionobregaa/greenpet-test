"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerEstoqueRoutes = registerEstoqueRoutes;
const validation_error_js_1 = require("../../../../shared/errors/validation.error.js");
const not_found_error_js_1 = require("../../../../shared/errors/not-found.error.js");
const estoque_schema_js_1 = require("./estoque.schema.js");
function registerEstoqueRoutes(app, prisma) {
    app.get('/api/v1/estoque', async (req, rep) => {
        const q = estoque_schema_js_1.ListEstoqueQuerySchema.safeParse(req.query);
        if (!q.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', q.error.errors[0].message);
        const where = q.data.produtoId ? { produtoId: q.data.produtoId } : {};
        const [rows, total] = await prisma.$transaction([
            prisma.estoqueItem.findMany({
                where,
                include: {
                    produto: {
                        select: { id: true, nome: true, categoria: true, imagemUrl: true, valorVenda: true, marca: true },
                    },
                },
                skip: (q.data.page - 1) * q.data.limit,
                take: q.data.limit,
                orderBy: [{ validade: 'asc' }, { createdAt: 'desc' }],
            }),
            prisma.estoqueItem.count({ where }),
        ]);
        rep.send({
            data: rows.map((r) => ({
                id: r.id,
                produtoId: r.produtoId,
                produto: r.produto,
                quantidade: r.quantidade,
                validade: r.validade,
                lote: r.lote,
                obs: r.obs,
                createdAt: r.createdAt,
                updatedAt: r.updatedAt,
            })),
            meta: { page: q.data.page, limit: q.data.limit, total },
        });
    });
    app.post('/api/v1/estoque', async (req, rep) => {
        const body = estoque_schema_js_1.CreateEstoqueItemSchema.safeParse(req.body);
        if (!body.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', body.error.errors[0].message);
        const produto = await prisma.produto.findUnique({ where: { id: body.data.produtoId } });
        if (!produto)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Produto não encontrado');
        const item = await prisma.estoqueItem.create({
            data: {
                id: crypto.randomUUID(),
                produtoId: body.data.produtoId,
                quantidade: body.data.quantidade,
                validade: body.data.validade ?? null,
                lote: body.data.lote ?? null,
                obs: body.data.obs ?? null,
            },
            include: {
                produto: { select: { id: true, nome: true, categoria: true, imagemUrl: true, valorVenda: true, marca: true } },
            },
        });
        rep.status(201).send({ data: item });
    });
    app.put('/api/v1/estoque/:id', async (req, rep) => {
        const { id } = req.params;
        const body = estoque_schema_js_1.UpdateEstoqueItemSchema.safeParse(req.body);
        if (!body.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', body.error.errors[0].message);
        const existing = await prisma.estoqueItem.findUnique({ where: { id } });
        if (!existing)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Item de estoque não encontrado');
        const item = await prisma.estoqueItem.update({
            where: { id },
            data: {
                ...(body.data.quantidade !== undefined && { quantidade: body.data.quantidade }),
                ...(body.data.validade !== undefined && { validade: body.data.validade }),
                ...(body.data.lote !== undefined && { lote: body.data.lote }),
                ...(body.data.obs !== undefined && { obs: body.data.obs }),
            },
            include: {
                produto: { select: { id: true, nome: true, categoria: true, imagemUrl: true, valorVenda: true, marca: true } },
            },
        });
        rep.send({ data: item });
    });
    app.delete('/api/v1/estoque/:id', async (req, rep) => {
        const { id } = req.params;
        const existing = await prisma.estoqueItem.findUnique({ where: { id } });
        if (!existing)
            throw new not_found_error_js_1.NotFoundError('NOT_FOUND', 'Item de estoque não encontrado');
        await prisma.estoqueItem.delete({ where: { id } });
        rep.status(204).send();
    });
}
//# sourceMappingURL=estoque.routes.js.map