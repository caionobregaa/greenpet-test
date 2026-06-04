"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutUseCase = void 0;
class LogoutUseCase {
    refreshRepo;
    constructor(refreshRepo) {
        this.refreshRepo = refreshRepo;
    }
    async execute(userId) {
        await this.refreshRepo.deleteByUserId(userId);
    }
}
exports.LogoutUseCase = LogoutUseCase;
//# sourceMappingURL=logout.use-case.js.map