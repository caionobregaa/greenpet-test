"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaProdutoRepository = void 0;
const produto_entity_js_1 = require("../../domain/entities/produto.entity.js");
class PrismaProdutoRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.produto.findFirst({ where: { id, deletedAt: null } });
        return row ? this.toDomain(row) : null;
    }
    async findByNome(nome) {
        const row = await this.prisma.produto.findFirst({ where: { nome, deletedAt: null } });
        return row ? this.toDomain(row) : null;
    }
    async findMany(params) {
        const where = {
            deletedAt: null,
            ...(params.categoria ? { categoria: params.categoria } : {}),
            ...(params.especie ? { especie: params.especie } : {}),
            ...(params.q ? { nome: { contains: params.q, mode: 'insensitive' } } : {}),
        };
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.produto.findMany({
                where,
                skip: (params.page - 1) * params.limit,
                take: params.limit,
                orderBy: { nome: 'asc' },
            }),
            this.prisma.produto.count({ where }),
        ]);
        return { produtos: rows.map((r) => this.toDomain(r)), total };
    }
    async save(produto) {
        const data = {
            nome: produto.nome,
            categoria: produto.categoria,
            especie: produto.especie ?? null,
            subCategoria: produto.subCategoria ?? null,
            marca: produto.marca ?? null,
            fornecedor: produto.fornecedor ?? null,
            pesoEmbalagem: produto.pesoEmbalagem ?? null,
            valorCusto: produto.valorCusto,
            valorVenda: produto.valorVenda,
            margemCartao: produto.margemCartao,
            margemImposto: produto.margemImposto,
            margemOperacao: produto.margemOperacao,
            margemLucro: produto.margemLucro,
            diasRecompra: produto.diasRecompra ?? null,
            descricao: produto.descricao ?? null,
            imagemUrl: produto.imagemUrl ?? null,
            deletedAt: produto.deletedAt ?? null,
        };
        await this.prisma.produto.upsert({
            where: { id: produto.id },
            create: { id: produto.id, ...data },
            update: data,
        });
    }
    toDomain(row) {
        return produto_entity_js_1.Produto.create({
            id: row.id,
            nome: row.nome,
            categoria: row.categoria,
            especie: row.especie ?? undefined,
            subCategoria: row.subCategoria ?? undefined,
            marca: row.marca ?? undefined,
            fornecedor: row.fornecedor ?? undefined,
            pesoEmbalagem: row.pesoEmbalagem != null ? Number(row.pesoEmbalagem) : undefined,
            valorCusto: Number(row.valorCusto),
            valorVenda: Number(row.valorVenda),
            margemCartao: Number(row.margemCartao),
            margemImposto: Number(row.margemImposto),
            margemOperacao: Number(row.margemOperacao),
            margemLucro: Number(row.margemLucro),
            diasRecompra: row.diasRecompra ?? undefined,
            descricao: row.descricao ?? undefined,
            imagemUrl: row.imagemUrl ?? undefined,
            deletedAt: row.deletedAt ?? undefined,
        });
    }
}
exports.PrismaProdutoRepository = PrismaProdutoRepository;
//# sourceMappingURL=prisma-produto.repository.js.map