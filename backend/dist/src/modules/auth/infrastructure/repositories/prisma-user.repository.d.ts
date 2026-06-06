import type { PrismaClient } from '@prisma/client';
import type { IUserRepository } from '../../domain/repositories/user.repository.interface.js';
import { User } from '../../domain/entities/user.entity.js';
export declare class PrismaUserRepository implements IUserRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    save(user: User): Promise<void>;
    private toDomain;
}
//# sourceMappingURL=prisma-user.repository.d.ts.map