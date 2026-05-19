import { z } from 'zod'

const OrcamentoItemSchema = z.object({
  produtoId: z.string().uuid().optional(),
  nome: z.string().min(1),
  qtd: z.number().int().positive(),
  valorUnitario: z.number().min(0),
})

export const CreateOrcamentoSchema = z.object({
  clienteId: z.string().uuid(),
  animalId: z.string().uuid().optional(),
  data: z.string().date().optional().transform((v) => v ? new Date(v) : undefined),
  validade: z.string().date().transform((v) => new Date(v)),
  obs: z.string().optional(),
  itens: z.array(OrcamentoItemSchema).min(1),
})

export const UpdateOrcamentoStatusSchema = z.object({
  acao: z.enum(['aprovar', 'recusar', 'reabrir']),
})

export const ConverterOrcamentoSchema = z.object({
  formaPag: z.enum(['Pix', 'Dinheiro', 'Cartão Crédito', 'Cartão Débito', 'Boleto']),
})

export const ListOrcamentosQuerySchema = z.object({
  clienteId: z.string().uuid().optional(),
  status: z.enum(['pendente', 'aprovado', 'recusado']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
