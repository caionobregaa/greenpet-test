import type { FastifyRequest, FastifyReply } from 'fastify';
import type { LoginUseCase } from '../../application/use-cases/login.use-case.js';
import type { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case.js';
import type { LogoutUseCase } from '../../application/use-cases/logout.use-case.js';
export declare class AuthController {
    private readonly loginUseCase;
    private readonly refreshTokenUseCase;
    private readonly logoutUseCase;
    constructor(loginUseCase: LoginUseCase, refreshTokenUseCase: RefreshTokenUseCase, logoutUseCase: LogoutUseCase);
    login(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    refresh(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    logout(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map