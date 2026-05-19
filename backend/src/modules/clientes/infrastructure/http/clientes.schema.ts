import { z } from 'zod'

const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/

export const CreateClienteSchema = z.object({
  nome: z.string().min(3),
  telefone: z.string().transform((v) => v.replace(/\D/g, '')).refine((v) => v.length === 11, 'Telefone deve ter 11 dígitos'),
  email: z.string().email().optional(),
  cpf: z.string().regex(CPF_REGEX).optional(),
  endereco: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().default('Manaus'),
  obs: z.string().optional(),
})

export const UpdateClienteSchema = CreateClienteSchema.partial()

export const ListClientesQuerySchema = z.object({
  q: z.string().optional(),
  cidade: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateClienteBody = z.infer<typeof CreateClienteSchema>
export type UpdateClienteBody = z.infer<typeof UpdateClienteSchema>
export type ListClientesQuery = z.infer<typeof ListClientesQuerySchema>
