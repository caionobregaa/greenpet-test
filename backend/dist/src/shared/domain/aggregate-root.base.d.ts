import { Entity } from './entity.base.js';
export declare abstract class AggregateRoot<T> extends Entity<T> {
    private _domainEvents;
    get domainEvents(): unknown[];
    protected addDomainEvent(event: unknown): void;
    clearDomainEvents(): void;
}
//# sourceMappingURL=aggregate-root.base.d.ts.map