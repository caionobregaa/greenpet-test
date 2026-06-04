import { AggregateRoot } from '@/shared/domain/aggregate-root.base.js';
interface UserProps {
    nome: string;
    email: string;
    senhaHash: string;
    papel: string;
    loginAttempts: number;
    lockedUntil?: Date;
}
export declare class User extends AggregateRoot<UserProps> {
    static create(data: {
        id?: string;
        nome: string;
        email: string;
        senhaHash: string;
        papel?: string;
        loginAttempts?: number;
        lockedUntil?: Date;
    }): User;
    get nome(): string;
    get email(): string;
    get senhaHash(): string;
    get papel(): string;
    get loginAttempts(): number;
    get lockedUntil(): Date | undefined;
    get isLocked(): boolean;
    recordFailedLogin(): void;
    resetLoginAttempts(): void;
}
export {};
//# sourceMappingURL=user.entity.d.ts.map