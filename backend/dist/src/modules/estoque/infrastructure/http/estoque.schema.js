"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListEstoqueQuerySchema = exports.UpdateEstoqueItemSchema = exports.CreateEstoqueItemSchema = void 0;
const zod_1 = require("zod");
exports.CreateEstoqueItemSchema = zod_1.z.object({
    produtoId: zod_1.z.string().uuid(),
    quantidade: zod_1.z.coerce.number().int().positive(),
    validade: zod_1.z.string().date().optional().transform((v) => v ? new Date(v) : undefined),
    lote: zod_1.z.string().optional(),
    obs: zod_1.z.string().optional(),
});
exports.UpdateEstoqueItemSchema = zod_1.z.object({
    quantidade: zod_1.z.coerce.number().int().positive().optional(),
    validade: zod_1.z.string().date().optional().nullable().transform((v) => v ? new Date(v) : null),
    lote: zod_1.z.string().optional(),
    obs: zod_1.z.string().optional(),
});
exports.ListEstoqueQuerySchema = zod_1.z.object({
    produtoId: zod_1.z.string().uuid().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(200).default(100),
});
//# sourceMappingURL=estoque.schema.js.map