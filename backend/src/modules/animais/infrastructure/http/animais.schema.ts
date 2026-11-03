import { z } from 'zod'

export const CreateAnimalSchema = z.object({
  nome: z.string().min(1),
  clienteId: z.string().guid(),
  especie: z.enum(['Cão', 'Gato']),
  raca: z.string().optional(),
  sexo: z.enum(['M', 'F', 'Indefinido']).default('Indefinido'),
  nascimento: z.string().date().optional().transform((v) => v ? new Date(v) : undefined),
  peso: z.number().min(0).default(0),
  obs: z.string().optional(),
})

// Edição parcial sem valores padrão: no zod 4 o padrão também vale dentro de .partial(),
// e um campo ausente na edição seria sobrescrito pelo padrão.
export const UpdateAnimalSchema = CreateAnimalSchema.omit({ clienteId: true }).extend({
  sexo: z.enum(['M', 'F', 'Indefinido']),
  peso: z.number().min(0),
}).partial()

export const ListAnimaisQuerySchema = z.object({
  clienteId: z.string().guid().optional(),
  especie: z.string().optional(),
  sexo: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
