import { z } from 'zod'

const VendaItemSchema = z.object({
  produtoId: z.string().uuid().optional(),
  nome: z.string().min(1),
  qtd: z.number().int().positive(),
  valorUnitario: z.number().min(0),
})

export const CreateVendaSchema = z.object({
  clienteId: z.string().uuid(),
  animalId: z.string().uuid().optional(),
  data: z.string().date().optional().transform((v) => v ? new Date(v) : undefined),
  formaPag: z.enum(['Pix', 'Dinheiro', 'Cartão Crédito', 'Cartão Débito', 'Boleto']),
  obs: z.string().optional(),
  itens: z.array(VendaItemSchema).min(1),
})

export const ListVendasQuerySchema = z.object({
  clienteId: z.string().uuid().optional(),
  animalId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
