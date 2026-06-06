"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
class Entity {
    _id;
    props;
    createdAt;
    updatedAt;
    constructor(props, id) {
        this._id = id ?? crypto.randomUUID();
        this.props = props;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    get id() {
        return this._id;
    }
    equals(other) {
        if (other === null || other === undefined)
            return false;
        if (other === this)
            return true;
        if (!(other instanceof Entity))
            return false;
        return this._id === other._id;
    }
}
exports.Entity = Entity;
//# sourceMappingURL=entity.base.js.map