import type { PrismaClient } from '@prisma/client';
import type { IRefreshTokenRepository } from '../../domain/repositories/refresh-token.repository.interface.js';
export declare class PrismaRefreshTokenRepository implements IRefreshTokenRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    create(data: {
        token: string;
        userId: string;
        expiresAt: Date;
    }): Promise<void>;
    findByToken(token: string): Promise<{
        id: string;
        token: string;
        userId: string;
        expiresAt: Date;
        usedAt: Date | undefined;
    } | null>;
    markAsUsed(token: string): Promise<void>;
    deleteByUserId(userId: string): Promise<void>;
}
//# sourceMappingURL=prisma-refresh-token.repository.d.ts.map