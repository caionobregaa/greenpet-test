import type { User } from '../entities/user.entity.js';
export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    save(user: User): Promise<void>;
}
//# sourceMappingURL=user.repository.interface.d.ts.map