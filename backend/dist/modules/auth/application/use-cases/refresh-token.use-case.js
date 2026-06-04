"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenUseCase = void 0;
const unauthorized_error_js_1 = require("@/shared/errors/unauthorized.error.js");
class RefreshTokenUseCase {
    userRepo;
    refreshRepo;
    jwtService;
    jwtExpiresIn;
    refreshExpiresInDays;
    constructor(userRepo, refreshRepo, jwtService, jwtExpiresIn, refreshExpiresInDays) {
        this.userRepo = userRepo;
        this.refreshRepo = refreshRepo;
        this.jwtService = jwtService;
        this.jwtExpiresIn = jwtExpiresIn;
        this.refreshExpiresInDays = refreshExpiresInDays;
    }
    async execute(token) {
        const stored = await this.refreshRepo.findByToken(token);
        if (!stored) {
            throw new unauthorized_error_js_1.UnauthorizedError('INVALID_REFRESH_TOKEN', 'Refresh token inválido');
        }
        if (stored.usedAt) {
            throw new unauthorized_error_js_1.UnauthorizedError('REFRESH_TOKEN_USED', 'Refresh token já utilizado');
        }
        if (stored.expiresAt < new Date()) {
            throw new unauthorized_error_js_1.UnauthorizedError('REFRESH_TOKEN_EXPIRED', 'Refresh token expirado');
        }
        const user = await this.userRepo.findById(stored.userId);
        if (!user) {
            throw new unauthorized_error_js_1.UnauthorizedError('INVALID_REFRESH_TOKEN', 'Refresh token inválido');
        }
        await this.refreshRepo.markAsUsed(token);
        const newToken = this.jwtService.sign({ sub: user.id, email: user.email, papel: user.papel }, this.jwtExpiresIn);
        const newRefreshToken = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.refreshExpiresInDays);
        await this.refreshRepo.create({
            token: newRefreshToken,
            userId: user.id,
            expiresAt,
        });
        return { token: newToken, refreshToken: newRefreshToken, expiresIn: this.jwtExpiresIn };
    }
}
exports.RefreshTokenUseCase = RefreshTokenUseCase;
//# sourceMappingURL=refresh-token.use-case.js.map