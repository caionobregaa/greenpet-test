"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListComprasQuerySchema = exports.UpdateCompraStatusSchema = exports.UpdateCompraSchema = exports.CreateCompraSchema = void 0;
const zod_1 = require("zod");
const CompraItemSchema = zod_1.z.object({
    produtoId: zod_1.z.string().uuid().optional(),
    nome: zod_1.z.string().min(1),
    qtd: zod_1.z.number().int().positive(),
    valorUnitario: zod_1.z.number().min(0),
});
exports.CreateCompraSchema = zod_1.z.object({
    fornecedor: zod_1.z.string().min(1),
    dataPedido: zod_1.z.string().date().optional().transform((v) => v ? new Date(v) : undefined),
    obs: zod_1.z.string().optional(),
    itens: zod_1.z.array(CompraItemSchema).min(1),
});
exports.UpdateCompraSchema = zod_1.z.object({
    fornecedor: zod_1.z.string().min(1).optional(),
    dataPedido: zod_1.z.string().date().optional().transform((v) => v ? new Date(v) : undefined),
    obs: zod_1.z.string().optional(),
    itens: zod_1.z.array(CompraItemSchema).optional(),
});
exports.UpdateCompraStatusSchema = zod_1.z.object({
    acao: zod_1.z.enum(['confirmar', 'receber', 'cancelar']),
});
exports.ListComprasQuerySchema = zod_1.z.object({
    status: zod_1.z.enum(['pendente', 'confirmado', 'recebido', 'cancelado']).optional(),
    fornecedor: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=compras.schema.js.map