"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeToken = makeToken;
const node_crypto_1 = require("node:crypto");
const TEST_JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-at-least-32-chars-long!!';
function makeToken(payload = {}) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const now = Math.floor(Date.now() / 1000);
    const body = Buffer.from(JSON.stringify({ sub: 'test-user-id', papel: 'admin', iat: now, exp: now + 28800, ...payload })).toString('base64url');
    const sig = (0, node_crypto_1.createHmac)('sha256', TEST_JWT_SECRET)
        .update(`${header}.${body}`)
        .digest('base64url');
    return `${header}.${body}.${sig}`;
}
//# sourceMappingURL=make-token.js.map