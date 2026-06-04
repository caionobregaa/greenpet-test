"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaCompraRepository = void 0;
const compra_entity_js_1 = require("../../domain/entities/compra.entity.js");
class PrismaCompraRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.compra.findUnique({ where: { id }, include: { itens: true } });
        return row ? this.toDomain(row) : null;
    }
    async findMany(params) {
        const where = {
            ...(params.status ? { status: params.status } : {}),
            ...(params.fornecedor ? { fornecedor: { contains: params.fornecedor, mode: 'insensitive' } } : {}),
        };
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.compra.findMany({
                where,
                include: { itens: true },
                skip: (params.page - 1) * params.limit,
                take: params.limit,
                orderBy: { dataPedido: 'desc' },
            }),
            this.prisma.compra.count({ where }),
        ]);
        return { compras: rows.map((r) => this.toDomain(r)), total };
    }
    async save(compra) {
        const existing = await this.prisma.compra.findUnique({ where: { id: compra.id } });
        if (existing) {
            await this.prisma.compra.update({
                where: { id: compra.id },
                data: {
                    fornecedor: compra.fornecedor,
                    status: compra.status,
                    obs: compra.obs ?? null,
                    total: compra.total,
                    dataPedido: compra.dataPedido,
                    dataRecebimento: compra.dataRecebimento ?? null,
                },
            });
        }
        else {
            await this.prisma.compra.create({
                data: {
                    id: compra.id,
                    fornecedor: compra.fornecedor,
                    dataPedido: compra.dataPedido,
                    dataRecebimento: compra.dataRecebimento ?? null,
                    status: compra.status,
                    total: compra.total,
                    obs: compra.obs ?? null,
                    itens: {
                        create: compra.itens.map((i) => ({
                            id: i.id,
                            produtoId: i.produtoId ?? null,
                            nome: i.nome,
                            qtd: i.qtd,
                            valorUnitario: i.valorUnitario,
                            total: i.total,
                        })),
                    },
                },
            });
        }
    }
    async delete(id) {
        await this.prisma.compra.delete({ where: { id } });
    }
    toDomain(row) {
        return compra_entity_js_1.Compra.create({
            id: row.id,
            fornecedor: row.fornecedor,
            dataPedido: row.dataPedido,
            dataRecebimento: row.dataRecebimento ?? undefined,
            status: row.status,
            obs: row.obs ?? undefined,
            itens: row.itens.map((i) => ({
                id: i.id,
                produtoId: i.produtoId ?? undefined,
                nome: i.nome,
                qtd: i.qtd,
                valorUnitario: Number(i.valorUnitario),
            })),
        });
    }
}
exports.PrismaCompraRepository = PrismaCompraRepository;
//# sourceMappingURL=prisma-compra.repository.js.map