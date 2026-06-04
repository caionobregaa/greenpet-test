"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UUID = void 0;
const value_object_base_js_1 = require("../value-object.base.js");
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
class UUID extends value_object_base_js_1.ValueObject {
    get value() {
        return this.props.value;
    }
    static create(value) {
        const id = value ?? crypto.randomUUID();
        if (!UUID_REGEX.test(id)) {
            throw new Error(`UUID inválido: ${id}`);
        }
        return new UUID({ value: id });
    }
    toString() {
        return this.props.value;
    }
}
exports.UUID = UUID;
//# sourceMappingURL=uuid.vo.js.map