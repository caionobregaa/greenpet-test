import type { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface.js';
export declare class LogoutUseCase {
    private readonly refreshRepo;
    constructor(refreshRepo: IRefreshTokenRepository);
    execute(userId: string): Promise<void>;
}
//# sourceMappingURL=logout.use-case.d.ts.map