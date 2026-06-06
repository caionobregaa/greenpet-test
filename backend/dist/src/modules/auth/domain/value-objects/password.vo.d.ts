export declare class Password {
    private readonly _hash;
    private constructor();
    get hash(): string;
    static validate(raw: string): void;
    static hash(raw: string, rounds?: number): Promise<string>;
    static fromHash(hash: string): Password;
    compare(raw: string): Promise<boolean>;
}
//# sourceMappingURL=password.vo.d.ts.map