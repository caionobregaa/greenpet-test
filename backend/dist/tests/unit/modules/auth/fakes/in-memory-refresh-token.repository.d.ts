import type { IRefreshTokenRepository } from '../../../../../src/modules/auth/domain/repositories/refresh-token.repository.interface';
interface StoredToken {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    usedAt?: Date;
}
export declare class InMemoryRefreshTokenRepository implements IRefreshTokenRepository {
    items: StoredToken[];
    create(data: {
        token: string;
        userId: string;
        expiresAt: Date;
    }): Promise<void>;
    findByToken(token: string): Promise<StoredToken | null>;
    markAsUsed(token: string): Promise<void>;
    deleteByUserId(userId: string): Promise<void>;
}
export {};
//# sourceMappingURL=in-memory-refresh-token.repository.d.ts.map