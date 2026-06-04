import { z } from 'zod'

function normalizeCPF(v: string): string {
  const d = v.replace(/\D/g, '')
  if (d.length !== 11) return v
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`
}

const CPF_FORMATTED = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/

export const CreateClienteSchema = z.object({
  nome: z.string().min(3),
  telefone: z.string().transform((v) => v.replace(/\D/g, '')).refine((v) => v.length === 11, 'Telefone deve ter 11 dígitos'),
  email: z.string().email().optional(),
  cpf: z.string().transform(normalizeCPF).refine((v) => CPF_FORMATTED.test(v), 'CPF inválido — informe 11 dígitos').optional(),
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
