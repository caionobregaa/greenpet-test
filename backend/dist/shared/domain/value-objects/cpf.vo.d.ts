import { ValueObject } from '../value-object.base.js';
interface CPFProps {
    value: string;
}
export declare class CPF extends ValueObject<CPFProps> {
    get value(): string;
    static create(raw: string): CPF;
    private static isValid;
    private static format;
    toString(): string;
}
export {};
//# sourceMappingURL=cpf.vo.d.ts.map