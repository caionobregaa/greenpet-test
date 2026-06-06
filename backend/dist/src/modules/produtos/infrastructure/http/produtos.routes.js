"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerProdutosRoutes = registerProdutosRoutes;
const prisma_produto_repository_js_1 = require("../repositories/prisma-produto.repository.js");
const create_produto_use_case_js_1 = require("../../application/use-cases/create-produto.use-case.js");
const update_produto_use_case_js_1 = require("../../application/use-cases/update-produto.use-case.js");
const delete_produto_use_case_js_1 = require("../../application/use-cases/delete-produto.use-case.js");
const get_produto_use_case_js_1 = require("../../application/use-cases/get-produto.use-case.js");
const list_produtos_use_case_js_1 = require("../../application/use-cases/list-produtos.use-case.js");
const produtos_schema_js_1 = require("./produtos.schema.js");
const validation_error_js_1 = require("../../../../shared/errors/validation.error.js");
function toResponse(p) {
    return {
        id: p.id,
        nome: p.nome,
        categoria: p.categoria,
        especie: p.especie,
        subCategoria: p.subCategoria,
        marca: p.marca,
        fornecedor: p.fornecedor,
        pesoEmbalagem: p.pesoEmbalagem,
        valorCusto: p.valorCusto,
        valorVenda: p.valorVenda,
        margemCalculada: p.margemCalculada,
        margemCartao: p.margemCartao,
        margemImposto: p.margemImposto,
        margemOperacao: p.margemOperacao,
        margemLucro: p.margemLucro,
        diasRecompra: p.diasRecompra,
        descricao: p.descricao,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
    };
}
function registerProdutosRoutes(app, prisma) {
    const repo = new prisma_produto_repository_js_1.PrismaProdutoRepository(prisma);
    const createUC = new create_produto_use_case_js_1.CreateProdutoUseCase(repo);
    const updateUC = new update_produto_use_case_js_1.UpdateProdutoUseCase(repo);
    const deleteUC = new delete_produto_use_case_js_1.DeleteProdutoUseCase(repo);
    const getUC = new get_produto_use_case_js_1.GetProdutoUseCase(repo);
    const listUC = new list_produtos_use_case_js_1.ListProdutosUseCase(repo);
    app.get('/api/v1/produtos', async (req, rep) => {
        const q = produtos_schema_js_1.ListProdutosQuerySchema.safeParse(req.query);
        if (!q.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', q.error.errors[0].message);
        const result = await listUC.execute(q.data);
        rep.send({ data: result.produtos.map(toResponse), meta: { page: q.data.page, limit: q.data.limit, total: result.total } });
    });
    app.post('/api/v1/produtos', async (req, rep) => {
        const body = produtos_schema_js_1.CreateProdutoSchema.safeParse(req.body);
        if (!body.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', body.error.errors[0].message);
        const produto = await createUC.execute(body.data);
        rep.status(201).send({ data: toResponse(produto) });
    });
    app.get('/api/v1/produtos/:id', async (req, rep) => {
        const { id } = req.params;
        const produto = await getUC.execute({ id });
        rep.send({ data: toResponse(produto) });
    });
    app.put('/api/v1/produtos/:id', async (req, rep) => {
        const { id } = req.params;
        const body = produtos_schema_js_1.UpdateProdutoSchema.safeParse(req.body);
        if (!body.success)
            throw new validation_error_js_1.ValidationError('VALIDATION_ERROR', body.error.errors[0].message);
        const produto = await updateUC.execute({ id, ...body.data });
        rep.send({ data: toResponse(produto) });
    });
    app.delete('/api/v1/produtos/:id', async (req, rep) => {
        const { id } = req.params;
        await deleteUC.execute({ id });
        rep.status(204).send();
    });
}
//# sourceMappingURL=produtos.routes.js.map