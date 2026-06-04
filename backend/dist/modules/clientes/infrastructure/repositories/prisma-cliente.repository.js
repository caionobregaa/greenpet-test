"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaClienteRepository = void 0;
const cliente_entity_js_1 = require("../../domain/entities/cliente.entity.js");
class PrismaClienteRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.cliente.findFirst({
            where: { id, deletedAt: null },
            include: { _count: { select: { animais: true } } },
        });
        return row ? this.toDomain(row) : null;
    }
    async findByEmail(email) {
        const row = await this.prisma.cliente.findFirst({ where: { email, deletedAt: null } });
        return row ? this.toDomain(row) : null;
    }
    async findByCpf(cpf) {
        const row = await this.prisma.cliente.findFirst({ where: { cpf, deletedAt: null } });
        return row ? this.toDomain(row) : null;
    }
    async findMany(params) {
        const where = {
            deletedAt: null,
            ...(params.cidade ? { cidade: params.cidade } : {}),
            ...(params.q
                ? { nome: { contains: params.q, mode: 'insensitive' } }
                : {}),
        };
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.cliente.findMany({
                where,
                skip: (params.page - 1) * params.limit,
                take: params.limit,
                orderBy: { nome: 'asc' },
                include: { _count: { select: { animais: true } } },
            }),
            this.prisma.cliente.count({ where }),
        ]);
        return { clientes: rows.map((r) => this.toDomain(r)), total };
    }
    async save(cliente) {
        const deleted = !!cliente.deletedAt;
        const data = {
            nome: cliente.nome,
            telefone: cliente.telefone,
            // Limpa campos únicos ao deletar para liberar o índice
            email: deleted ? null : (cliente.email ?? null),
            cpf: deleted ? null : (cliente.cpf ?? null),
            endereco: cliente.endereco ?? null,
            bairro: cliente.bairro ?? null,
            cidade: cliente.cidade,
            obs: cliente.obs ?? null,
            deletedAt: cliente.deletedAt ?? null,
        };
        await this.prisma.cliente.upsert({
            where: { id: cliente.id },
            create: { id: cliente.id, ...data },
            update: data,
        });
    }
    async hasActiveSalesOrQuotes(clienteId) {
        const [vendas, orcamentos] = await this.prisma.$transaction([
            this.prisma.venda.count({ where: { clienteId } }),
            this.prisma.orcamento.count({ where: { clienteId, status: { not: 'recusado' } } }),
        ]);
        return vendas > 0 || orcamentos > 0;
    }
    toDomain(row) {
        return cliente_entity_js_1.Cliente.create({
            id: row.id,
            nome: row.nome,
            telefone: row.telefone,
            email: row.email ?? undefined,
            cpf: row.cpf ?? undefined,
            endereco: row.endereco ?? undefined,
            bairro: row.bairro ?? undefined,
            cidade: row.cidade,
            obs: row.obs ?? undefined,
            deletedAt: row.deletedAt ?? undefined,
            numeroDeAnimais: row._count?.animais ?? 0,
        });
    }
}
exports.PrismaClienteRepository = PrismaClienteRepository;
//# sourceMappingURL=prisma-cliente.repository.js.map