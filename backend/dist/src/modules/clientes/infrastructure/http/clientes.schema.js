"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListClientesQuerySchema = exports.UpdateClienteSchema = exports.CreateClienteSchema = void 0;
const zod_1 = require("zod");
function normalizeCPF(v) {
    const d = v.replace(/\D/g, '');
    if (d.length !== 11)
        return v;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}
const CPF_FORMATTED = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
exports.CreateClienteSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3),
    telefone: zod_1.z.string().transform((v) => v.replace(/\D/g, '')).refine((v) => v.length === 11, 'Telefone deve ter 11 dígitos'),
    email: zod_1.z.string().email().optional(),
    cpf: zod_1.z.string().transform(normalizeCPF).refine((v) => CPF_FORMATTED.test(v), 'CPF inválido — informe 11 dígitos').optional(),
    endereco: zod_1.z.string().optional(),
    bairro: zod_1.z.string().optional(),
    cidade: zod_1.z.string().default('Manaus'),
    obs: zod_1.z.string().optional(),
});
exports.UpdateClienteSchema = exports.CreateClienteSchema.partial();
exports.ListClientesQuerySchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    cidade: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=clientes.schema.js.map