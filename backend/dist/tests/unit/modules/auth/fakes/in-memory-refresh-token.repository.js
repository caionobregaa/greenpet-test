"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryRefreshTokenRepository = void 0;
class InMemoryRefreshTokenRepository {
    items = [];
    async create(data) {
        this.items.push({
            id: crypto.randomUUID(),
            token: data.token,
            userId: data.userId,
            expiresAt: data.expiresAt,
        });
    }
    async findByToken(token) {
        return this.items.find((t) => t.token === token) ?? null;
    }
    async markAsUsed(token) {
        const t = this.items.find((i) => i.token === token);
        if (t)
            t.usedAt = new Date();
    }
    async deleteByUserId(userId) {
        this.items = this.items.filter((t) => t.userId !== userId);
    }
}
exports.InMemoryRefreshTokenRepository = InMemoryRefreshTokenRepository;
//# sourceMappingURL=in-memory-refresh-token.repository.js.map