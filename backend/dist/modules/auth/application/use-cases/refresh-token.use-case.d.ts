import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import type { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface.js';
import type { IJwtService } from './login.use-case.js';
export interface RefreshTokenOutput {
    token: string;
    refreshToken: string;
    expiresIn: number;
}
export declare class RefreshTokenUseCase {
    private readonly userRepo;
    private readonly refreshRepo;
    private readonly jwtService;
    private readonly jwtExpiresIn;
    private readonly refreshExpiresInDays;
    constructor(userRepo: IUserRepository, refreshRepo: IRefreshTokenRepository, jwtService: IJwtService, jwtExpiresIn: number, refreshExpiresInDays: number);
    execute(token: string): Promise<RefreshTokenOutput>;
}
//# sourceMappingURL=refresh-token.use-case.d.ts.map