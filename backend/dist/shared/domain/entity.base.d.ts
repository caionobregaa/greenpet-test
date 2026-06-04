export declare abstract class Entity<T> {
    protected readonly _id: string;
    protected props: T;
    readonly createdAt: Date;
    updatedAt: Date;
    constructor(props: T, id?: string);
    get id(): string;
    equals(other: Entity<T>): boolean;
}
//# sourceMappingURL=entity.base.d.ts.map