import { z } from 'zod'

const PHONE_REGEX = /^\(\d{2}\) \d \d{4}-\d{4}$|^\(\d{2}\) \d{4}-\d{4}$/
const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/

export const CreateClienteSchema = z.object({
  nome: z.string().min(3),
  telefone: z.string().regex(PHONE_REGEX, 'Formato inválido. Use (99) 9 9999-9999'),
  email: z.string().email().optional(),
  cpf: z.string().regex(CPF_REGEX).optional(),
  endereco: z.string().optional(),
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
