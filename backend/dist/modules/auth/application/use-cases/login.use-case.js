"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
const password_vo_js_1 = require("../../domain/value-objects/password.vo.js");
const unauthorized_error_js_1 = require("@/shared/errors/unauthorized.error.js");
class LoginUseCase {
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
    async execute(input) {
        const user = await this.userRepo.findByEmail(input.email);
        if (!user) {
            throw new unauthorized_error_js_1.UnauthorizedError('INVALID_CREDENTIALS', 'E-mail ou senha inválidos');
        }
        if (user.isLocked) {
            throw new unauthorized_error_js_1.UnauthorizedError('ACCOUNT_LOCKED', 'Conta bloqueada. Tente novamente mais tarde.');
        }
        const pwd = password_vo_js_1.Password.fromHash(user.senhaHash);
        const valid = await pwd.compare(input.password);
        if (!valid) {
            user.recordFailedLogin();
            await this.userRepo.save(user);
            throw new unauthorized_error_js_1.UnauthorizedError('INVALID_CREDENTIALS', 'E-mail ou senha inválidos');
        }
        user.resetLoginAttempts();
        await this.userRepo.save(user);
        const token = this.jwtService.sign({ sub: user.id, email: user.email, papel: user.papel }, this.jwtExpiresIn);
        const refreshToken = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.refreshExpiresInDays);
        await this.refreshRepo.create({ token: refreshToken, userId: user.id, expiresAt });
        return {
            token,
            refreshToken,
            expiresIn: this.jwtExpiresIn,
            user: { id: user.id, nome: user.nome, email: user.email, papel: user.papel },
        };
    }
}
exports.LoginUseCase = LoginUseCase;
//# sourceMappingURL=login.use-case.js.map