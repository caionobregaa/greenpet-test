"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListAnimaisQuerySchema = exports.UpdateAnimalSchema = exports.CreateAnimalSchema = void 0;
const zod_1 = require("zod");
exports.CreateAnimalSchema = zod_1.z.object({
    nome: zod_1.z.string().min(1),
    clienteId: zod_1.z.string().uuid(),
    especie: zod_1.z.enum(['Cão', 'Gato']),
    raca: zod_1.z.string().optional(),
    sexo: zod_1.z.enum(['M', 'F', 'Indefinido']).default('Indefinido'),
    nascimento: zod_1.z.string().date().optional().transform((v) => v ? new Date(v) : undefined),
    peso: zod_1.z.number().min(0).default(0),
    obs: zod_1.z.string().optional(),
});
exports.UpdateAnimalSchema = exports.CreateAnimalSchema.omit({ clienteId: true }).partial();
exports.ListAnimaisQuerySchema = zod_1.z.object({
    clienteId: zod_1.z.string().uuid().optional(),
    q: zod_1.z.string().optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
//# sourceMappingURL=animais.schema.js.map