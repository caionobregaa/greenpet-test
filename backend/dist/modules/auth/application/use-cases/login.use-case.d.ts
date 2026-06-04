import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import type { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface.js';
export interface IJwtService {
    sign(payload: Record<string, unknown>, expiresIn: number): string;
}
export interface LoginInput {
    email: string;
    password: string;
}
export interface LoginOutput {
    token: string;
    refreshToken: string;
    expiresIn: number;
    user: {
        id: string;
        nome: string;
        email: string;
        papel: string;
    };
}
export declare class LoginUseCase {
    private readonly userRepo;
    private readonly refreshRepo;
    private readonly jwtService;
    private readonly jwtExpiresIn;
    private readonly refreshExpiresInDays;
    constructor(userRepo: IUserRepository, refreshRepo: IRefreshTokenRepository, jwtService: IJwtService, jwtExpiresIn: number, refreshExpiresInDays: number);
    execute(input: LoginInput): Promise<LoginOutput>;
}
//# sourceMappingURL=login.use-case.d.ts.map