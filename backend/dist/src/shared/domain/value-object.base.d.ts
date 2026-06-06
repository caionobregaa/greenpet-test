export declare abstract class ValueObject<T> {
    protected readonly props: T;
    constructor(props: T);
    equals(other: ValueObject<T>): boolean;
}
//# sourceMappingURL=value-object.base.d.ts.map