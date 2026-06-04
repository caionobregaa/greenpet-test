import { ValueObject } from '../value-object.base.js';
interface PhoneProps {
    value: string;
}
export declare class Phone extends ValueObject<PhoneProps> {
    get value(): string;
    static create(raw: string): Phone;
    toString(): string;
}
export {};
//# sourceMappingURL=phone.vo.d.ts.map