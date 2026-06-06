"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaRefreshTokenRepository = void 0;
class PrismaRefreshTokenRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        await this.prisma.refreshToken.create({
            data: { token: data.token, userId: data.userId, expiresAt: data.expiresAt },
        });
    }
    async findByToken(token) {
        const row = await this.prisma.refreshToken.findUnique({ where: { token } });
        if (!row)
            return null;
        return {
            id: row.id,
            token: row.token,
            userId: row.userId,
            expiresAt: row.expiresAt,
            usedAt: row.usedAt ?? undefined,
        };
    }
    async markAsUsed(token) {
        await this.prisma.refreshToken.update({
            where: { token },
            data: { usedAt: new Date() },
        });
    }
    async deleteByUserId(userId) {
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
    }
}
exports.PrismaRefreshTokenRepository = PrismaRefreshTokenRepository;
//# sourceMappingURL=prisma-refresh-token.repository.js.map