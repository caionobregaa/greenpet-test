"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string().url(),
    TEST_DATABASE_URL: zod_1.z.string().url().optional(),
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_EXPIRES_IN: zod_1.z.coerce.number().default(28800),
    REFRESH_TOKEN_EXPIRES_IN: zod_1.z.coerce.number().default(30),
    BCRYPT_ROUNDS: zod_1.z.coerce.number().min(10).default(12),
    PORT: zod_1.z.coerce.number().default(3000),
    HOST: zod_1.z.string().default('0.0.0.0'),
    NODE_ENV: zod_1.z.enum(['development', 'test', 'production']).default('development'),
    TZ: zod_1.z.string().default('America/Manaus'),
});
exports.env = envSchema.parse(process.env);
//# sourceMappingURL=env.js.map