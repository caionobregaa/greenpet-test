import { ValueObject } from '../value-object.base.js';
interface PhoneProps {
    value: string;
}
export declare class Phone extends ValueObject<PhoneProps> {
    get value(): string;
    static create(raw: string): Phone;
    /** Reconstitui a partir do banco sem validação — aceita qualquer formato já armazenado. */
    static fromRaw(value: string): Phone;
    toString(): string;
}
export {};
//# sourceMappingURL=phone.vo.d.ts.map