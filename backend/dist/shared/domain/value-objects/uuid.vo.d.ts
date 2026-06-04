import { ValueObject } from '../value-object.base.js';
interface UUIDProps {
    value: string;
}
export declare class UUID extends ValueObject<UUIDProps> {
    get value(): string;
    static create(value?: string): UUID;
    toString(): string;
}
export {};
//# sourceMappingURL=uuid.vo.d.ts.map