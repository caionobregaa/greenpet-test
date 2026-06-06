import { ValueObject } from '../value-object.base.js';
interface EmailProps {
    value: string;
}
export declare class Email extends ValueObject<EmailProps> {
    get value(): string;
    static create(raw: string): Email;
    toString(): string;
}
export {};
//# sourceMappingURL=email.vo.d.ts.map