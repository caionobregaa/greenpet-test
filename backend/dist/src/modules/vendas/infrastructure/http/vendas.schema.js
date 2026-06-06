"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListVendasQuerySchema = exports.CreateVendaSchema = void 0;
const zod_1 = require("zod");
const VendaItemSchema = zod_1.z.object({
    produtoId: zod_1.z.string().uuid().optional(),
    nome: zod_1.z.string().min(1),
    qtd: zod_1.z.number().int().positive(),
    valorUnitario: zod_1.z.number().min(0),
});
exports.CreateVendaSchema = zod_1.z.object({
    clienteId: zod_1.z.string().uuid(),
    animalId: zod_1.z.string().uuid().optional(),
    data: zod_1.z.string().date().optional().transform((v) => v ? new Date(v) : undefined),
    formaPag: zod_1.z.enum(['Pix', 'Dinheiro', 'Cartão Crédito', 'Cartão Débito', 'Boleto']),
    obs: zod_1.z.string().optional(),
    itens: zod_1.z.array(VendaItemSchema).min(1),
});
exports.ListVendasQuerySchema = zod_1.z.object({
    clienteId: zod_1.z.string().uuid().optional(),
    animalId: zod_1.z.string().uuid().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=vendas.schema.js.map