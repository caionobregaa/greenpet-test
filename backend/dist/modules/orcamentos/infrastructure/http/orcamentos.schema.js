"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListOrcamentosQuerySchema = exports.ConverterOrcamentoSchema = exports.UpdateOrcamentoStatusSchema = exports.CreateOrcamentoSchema = exports.UpdateOrcamentoSchema = void 0;
const zod_1 = require("zod");
const OrcamentoItemSchema = zod_1.z.object({
    produtoId: zod_1.z.string().uuid().nullable().optional().transform((v) => v ?? undefined),
    nome: zod_1.z.string().min(1),
    qtd: zod_1.z.coerce.number().int().positive(),
    valorUnitario: zod_1.z.coerce.number().min(0),
});
exports.UpdateOrcamentoSchema = zod_1.z.object({
    validade: zod_1.z.string().date().transform((v) => new Date(v)).optional(),
    obs: zod_1.z.string().optional(),
    itens: zod_1.z.array(OrcamentoItemSchema).min(1).optional(),
});
exports.CreateOrcamentoSchema = zod_1.z.object({
    clienteId: zod_1.z.string().uuid().optional(),
    animalId: zod_1.z.string().uuid().optional(),
    data: zod_1.z.string().date().optional().transform((v) => v ? new Date(v) : undefined),
    validade: zod_1.z.string().date().transform((v) => new Date(v)),
    obs: zod_1.z.string().optional(),
    formasPag: zod_1.z.array(zod_1.z.string()).optional().default([]),
    itens: zod_1.z.array(OrcamentoItemSchema).min(1),
});
exports.UpdateOrcamentoStatusSchema = zod_1.z.object({
    acao: zod_1.z.enum(['aprovar', 'recusar', 'reabrir']),
});
exports.ConverterOrcamentoSchema = zod_1.z.object({
    formaPag: zod_1.z.enum(['Pix', 'Dinheiro', 'Cartão Crédito', 'Cartão Débito', 'Boleto']),
    taxaCartao: zod_1.z.number().min(0).max(100).optional().default(0),
});
exports.ListOrcamentosQuerySchema = zod_1.z.object({
    clienteId: zod_1.z.string().uuid().optional(),
    status: zod_1.z.enum(['pendente', 'aprovado', 'recusado']).optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=orcamentos.schema.js.map