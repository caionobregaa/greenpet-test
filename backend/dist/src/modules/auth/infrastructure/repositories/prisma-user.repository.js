"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaUserRepository = void 0;
const user_entity_js_1 = require("../../domain/entities/user.entity.js");
class PrismaUserRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(id) {
        const row = await this.prisma.user.findUnique({ where: { id } });
        return row ? this.toDomain(row) : null;
    }
    async findByEmail(email) {
        const row = await this.prisma.user.findUnique({ where: { email } });
        return row ? this.toDomain(row) : null;
    }
    async save(user) {
        await this.prisma.user.upsert({
            where: { id: user.id },
            create: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                senhaHash: user.senhaHash,
                papel: user.papel,
                loginAttempts: user.loginAttempts,
                lockedUntil: user.lockedUntil ?? null,
            },
            update: {
                nome: user.nome,
                email: user.email,
                senhaHash: user.senhaHash,
                papel: user.papel,
                loginAttempts: user.loginAttempts,
                lockedUntil: user.lockedUntil ?? null,
            },
        });
    }
    toDomain(row) {
        return user_entity_js_1.User.create({
            id: row.id,
            nome: row.nome,
            email: row.email,
            senhaHash: row.senhaHash,
            papel: row.papel,
            loginAttempts: row.loginAttempts,
            lockedUntil: row.lockedUntil ?? undefined,
        });
    }
}
exports.PrismaUserRepository = PrismaUserRepository;
//# sourceMappingURL=prisma-user.repository.js.map