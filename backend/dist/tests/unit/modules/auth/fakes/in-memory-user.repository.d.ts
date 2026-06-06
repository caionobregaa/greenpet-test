import type { IUserRepository } from '../../../../../src/modules/auth/domain/repositories/user.repository.interface';
import { User } from '../../../../../src/modules/auth/domain/entities/user.entity';
export declare class InMemoryUserRepository implements IUserRepository {
    items: User[];
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    save(user: User): Promise<void>;
}
//# sourceMappingURL=in-memory-user.repository.d.ts.map