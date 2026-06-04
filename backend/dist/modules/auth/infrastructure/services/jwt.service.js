"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const node_crypto_1 = require("node:crypto");
class JwtService {
    secret;
    constructor(secret) {
        this.secret = secret;
    }
    sign(payload, expiresIn) {
        const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
        const now = Math.floor(Date.now() / 1000);
        const body = Buffer.from(JSON.stringify({ ...payload, iat: now, exp: now + expiresIn })).toString('base64url');
        const sig = (0, node_crypto_1.createHmac)('sha256', this.secret)
            .update(`${header}.${body}`)
            .digest('base64url');
        return `${header}.${body}.${sig}`;
    }
}
exports.JwtService = JwtService;
//# sourceMappingURL=jwt.service.js.map