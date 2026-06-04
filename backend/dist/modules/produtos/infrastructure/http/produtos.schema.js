"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListProdutosQuerySchema = exports.UpdateProdutoSchema = exports.CreateProdutoSchema = void 0;
const zod_1 = require("zod");
exports.CreateProdutoSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1),
    categoria: zod_1.z.enum(['Ração', 'Petisco', 'Medicamento', 'Acessório', 'Higiene', 'Serviço']),
    especie: zod_1.z.enum(['Cão', 'Gato', 'Ambos']).optional(),
    subCategoria: zod_1.z.string().optional(),
    marca: zod_1.z.string().optional(),
    fornecedor: zod_1.z.string().optional(),
    pesoEmbalagem: zod_1.z.number().positive().optional(),
    valorCusto: zod_1.z.number().min(0).default(0),
    valorVenda: zod_1.z.number().min(0),
    margemCartao: zod_1.z.number().min(0).default(0),
    margemImposto: zod_1.z.number().min(0).default(0),
    margemOperacao: zod_1.z.number().min(0).default(0),
    margemLucro: zod_1.z.number().min(0).default(0),
    diasRecompra: zod_1.z.number().int().positive().optional(),
    descricao: zod_1.z.string().optional(),
    imagemUrl: zod_1.z.string().url().optional().or(zod_1.z.literal('')),
});
exports.UpdateProdutoSchema = exports.CreateProdutoSchema.partial();
exports.ListProdutosQuerySchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    categoria: zod_1.z.string().optional(),
    especie: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=produtos.schema.js.map