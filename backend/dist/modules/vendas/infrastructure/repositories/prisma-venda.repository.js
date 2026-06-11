"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaVendaRepository = void 0;
const venda_entity_js_1 = require("../../domain/entities/venda.entity.js");
class PrismaVendaRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.venda.findUnique({ where: { id }, include: { itens: true } });
        return row ? this.toDomain(row) : null;
    }
    async findMany(params) {
        const where = {
            ...(params.clienteId ? { clienteId: params.clienteId } : {}),
            ...(params.animalId ? { animalId: params.animalId } : {}),
        };
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.venda.findMany({
                where,
                include: { itens: true },
                skip: (params.page - 1) * params.limit,
                take: params.limit,
                orderBy: { data: 'desc' },
            }),
            this.prisma.venda.count({ where }),
        ]);
        return { vendas: rows.map((r) => this.toDomain(r)), total };
    }
    async save(venda) {
        await this.prisma.venda.upsert({
            where: { id: venda.id },
            create: {
                id: venda.id,
                data: venda.data,
                clienteId: venda.clienteId,
                animalId: venda.animalId ?? null,
                formaPag: venda.formaPag,
                taxaCartao: venda.taxaCartao,
                total: venda.total,
                obs: venda.obs ?? null,
                itens: {
                    create: venda.itens.map((i) => ({
                        id: i.id,
                        produtoId: i.produtoId ?? null,
                        nome: i.nome,
                        qtd: i.qtd,
                        valorUnitario: i.valorUnitario,
                        total: i.total,
                    })),
                },
            },
            update: {},
        });
    }
    async delete(id) {
        await this.prisma.venda.delete({ where: { id } });
    }
    toDomain(row) {
        return venda_entity_js_1.Venda.create({
            id: row.id,
            clienteId: row.clienteId,
            animalId: row.animalId ?? undefined,
            data: row.data,
            formaPag: row.formaPag,
            taxaCartao: row.taxaCartao ?? 0,
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
exports.PrismaVendaRepository = PrismaVendaRepository;
//# sourceMappingURL=prisma-venda.repository.js.map