"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
const value_object_base_js_1 = require("../value-object.base.js");
class Money extends value_object_base_js_1.ValueObject {
    get value() {
        return this.props.value;
    }
    static create(value) {
        if (typeof value !== 'number' || isNaN(value)) {
            throw new Error('Valor monetário deve ser um número');
        }
        if (value < 0) {
            throw new Error('Valor monetário não pode ser negativo');
        }
        return new Money({ value: Math.round(value * 100) / 100 });
    }
    add(other) {
        return Money.create(this.value + other.value);
    }
    multiply(qty) {
        return Money.create(this.value * qty);
    }
    toString() {
        return this.props.value.toFixed(2);
    }
}
exports.Money = Money;
//# sourceMappingURL=money.vo.js.map