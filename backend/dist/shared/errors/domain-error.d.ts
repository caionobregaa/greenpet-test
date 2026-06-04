export declare abstract class DomainError extends Error {
    readonly code: string;
    readonly fields?: Record<string, string> | undefined;
    abstract readonly statusCode: number;
    constructor(code: string, message: string, fields?: Record<string, string> | undefined);
}
//# sourceMappingURL=domain-error.d.ts.map