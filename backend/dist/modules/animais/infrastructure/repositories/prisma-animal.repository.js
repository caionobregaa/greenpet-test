"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaAnimalRepository = void 0;
const animal_entity_js_1 = require("../../domain/entities/animal.entity.js");
class PrismaAnimalRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.animal.findFirst({ where: { id, deletedAt: null } });
        return row ? this.toDomain(row) : null;
    }
    async findMany(params) {
        const where = {
            deletedAt: null,
            ...(params.clienteId ? { clienteId: params.clienteId } : {}),
        };
        const [rows, total] = await this.prisma.$transaction([
            this.prisma.animal.findMany({
                where,
                include: { cliente: { select: { nome: true } } },
                skip: (params.page - 1) * params.limit,
                take: params.limit,
                orderBy: { nome: 'asc' },
            }),
            this.prisma.animal.count({ where }),
        ]);
        const clienteNomes = {};
        rows.forEach((r) => { clienteNomes[r.id] = r.cliente?.nome ?? ''; });
        return { animais: rows.map((r) => this.toDomain(r)), clienteNomes, total };
    }
    async save(animal) {
        const data = {
            nome: animal.nome,
            clienteId: animal.clienteId,
            especie: animal.especie,
            raca: animal.raca ?? null,
            sexo: animal.sexo,
            nascimento: animal.nascimento ?? null,
            peso: animal.peso,
            obs: animal.obs ?? null,
            deletedAt: animal.deletedAt ?? null,
        };
        await this.prisma.animal.upsert({
            where: { id: animal.id },
            create: { id: animal.id, ...data },
            update: data,
        });
    }
    toDomain(row) {
        return animal_entity_js_1.Animal.create({
            id: row.id,
            nome: row.nome,
            clienteId: row.clienteId,
            especie: row.especie,
            raca: row.raca ?? undefined,
            sexo: row.sexo,
            nascimento: row.nascimento ?? undefined,
            peso: Number(row.peso),
            obs: row.obs ?? undefined,
            deletedAt: row.deletedAt ?? undefined,
        });
    }
}
exports.PrismaAnimalRepository = PrismaAnimalRepository;
//# sourceMappingURL=prisma-animal.repository.js.map