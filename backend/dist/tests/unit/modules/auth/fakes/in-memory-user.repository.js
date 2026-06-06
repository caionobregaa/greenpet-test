"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryUserRepository = void 0;
class InMemoryUserRepository {
    items = [];
    async findById(id) {
        return this.items.find((u) => u.id === id) ?? null;
    }
    async findByEmail(email) {
        return this.items.find((u) => u.email === email) ?? null;
    }
    async save(user) {
        const idx = this.items.findIndex((u) => u.id === user.id);
        if (idx >= 0)
            this.items[idx] = user;
        else
            this.items.push(user);
    }
}
exports.InMemoryUserRepository = InMemoryUserRepository;
//# sourceMappingURL=in-memory-user.repository.js.map