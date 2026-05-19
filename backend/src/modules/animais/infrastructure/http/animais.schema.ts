import { z } from 'zod'

export const CreateAnimalSchema = z.object({
  nome: z.string().min(1),
  clienteId: z.string().uuid(),
  especie: z.enum(['Cão', 'Gato']),
  raca: z.string().optional(),
  sexo: z.enum(['M', 'F', 'Indefinido']).default('Indefinido'),
  nascimento: z.string().date().optional().transform((v) => v ? new Date(v) : undefined),
  peso: z.number().min(0).default(0),
  obs: z.string().optional(),
})

export const UpdateAnimalSchema = CreateAnimalSchema.omit({ clienteId: true }).partial()

export const ListAnimaisQuerySchema = z.object({
  clienteId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
