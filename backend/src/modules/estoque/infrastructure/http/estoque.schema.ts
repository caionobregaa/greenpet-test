import { z } from 'zod'

export const CreateEstoqueItemSchema = z.object({
  produtoId: z.string().uuid(),
  quantidade: z.coerce.number().int().positive(),
  validade: z.string().date().optional().transform((v) => v ? new Date(v) : undefined),
  lote: z.string().optional(),
  obs: z.string().optional(),
})

export const UpdateEstoqueItemSchema = z.object({
  quantidade: z.coerce.number().int().positive().optional(),
  validade: z.string().date().optional().nullable().transform((v) => v ? new Date(v) : null),
  lote: z.string().optional(),
  obs: z.string().optional(),
})

export const ListEstoqueQuerySchema = z.object({
  produtoId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(100),
})
