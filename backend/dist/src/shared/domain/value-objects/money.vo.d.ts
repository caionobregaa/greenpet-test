import { ValueObject } from '../value-object.base.js';
interface MoneyProps {
    value: number;
}
export declare class Money extends ValueObject<MoneyProps> {
    get value(): number;
    static create(value: number): Money;
    add(other: Money): Money;
    multiply(qty: number): Money;
    toString(): string;
}
export {};
//# sourceMappingURL=money.vo.d.ts.map