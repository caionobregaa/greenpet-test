import { z } from 'zod'

const VendaItemSchema = z.object({
  produtoId: z.string().uuid().nullable().optional().transform((v) => v ?? undefined),
  nome: z.string().min(1),
  qtd: z.number().int().positive(),
  valorUnitario: z.number().min(0),
  desconto: z.number().min(0).optional().default(0),
  itemAnimalId: z.string().nullable().optional().transform((v) => v || undefined),
  consumoDiario: z.number().int().min(1).nullable().optional().transform((v) => v ?? undefined),
  recompraData: z.string().date().nullable().optional().transform((v) => v ? new Date(v) : undefined),
})

export const CreateVendaSchema = z.object({
  clienteId: z.string().uuid(),
  animalId: z.string().uuid().nullable().optional().transform((v) => v ?? undefined),
  data: z.string().date().optional().transform((v) => v ? new Date(v + 'T12:00:00.000Z') : undefined),
  formaPag: z.enum(['Pix', 'Dinheiro', 'Cartão Crédito', 'Cartão Débito', 'Boleto']),
  taxaCartao: z.number().min(0).max(100).optional().default(0),
  taxaEntrega: z.number().min(0).optional().default(0),
  desconto: z.number().min(0).optional().default(0),
  obs: z.string().optional(),
  itens: z.array(VendaItemSchema).min(1),
})

export const UpdateVendaSchema = z.object({
  animalId: z.string().uuid().nullable().optional().transform((v) => v ?? undefined),
  data: z.string().date().optional().transform((v) => v ? new Date(v + 'T12:00:00.000Z') : undefined),
  formaPag: z.enum(['Pix', 'Dinheiro', 'Cartão Crédito', 'Cartão Débito', 'Boleto']).optional(),
  taxaCartao: z.number().min(0).max(100).optional(),
  taxaEntrega: z.number().min(0).optional(),
  desconto: z.number().min(0).optional(),
  obs: z.string().optional(),
  itens: z.array(VendaItemSchema).min(1).optional(),
})

export const ListVendasQuerySchema = z.object({
  clienteId: z.string().uuid().optional(),
  animalId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
