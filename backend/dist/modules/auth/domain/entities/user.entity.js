"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const aggregate_root_base_js_1 = require("../../../../src/shared/domain/aggregate-root.base.js");
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;
class User extends aggregate_root_base_js_1.AggregateRoot {
    static create(data) {
        return new User({
            nome: data.nome,
            email: data.email,
            senhaHash: data.senhaHash,
            papel: data.papel ?? 'admin',
            loginAttempts: data.loginAttempts ?? 0,
            lockedUntil: data.lockedUntil,
        }, data.id);
    }
    get nome() { return this.props.nome; }
    get email() { return this.props.email; }
    get senhaHash() { return this.props.senhaHash; }
    get papel() { return this.props.papel; }
    get loginAttempts() { return this.props.loginAttempts; }
    get lockedUntil() { return this.props.lockedUntil; }
    get isLocked() {
        if (!this.props.lockedUntil)
            return false;
        return this.props.lockedUntil > new Date();
    }
    recordFailedLogin() {
        this.props.loginAttempts += 1;
        if (this.props.loginAttempts >= MAX_ATTEMPTS) {
            this.props.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        }
    }
    resetLoginAttempts() {
        this.props.loginAttempts = 0;
        this.props.lockedUntil = undefined;
    }
}
exports.User = User;
//# sourceMappingURL=user.entity.js.map