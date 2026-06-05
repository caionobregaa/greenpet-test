import { z } from 'zod'

const CompraItemSchema = z.object({
  produtoId: z.string().uuid().optional(),
  nome: z.string().min(1),
  qtd: z.number().int().positive(),
  valorUnitario: z.number().min(0),
})

export const CreateCompraSchema = z.object({
  fornecedor: z.string().min(1),
  dataPedido: z.string().date().optional().transform((v) => v ? new Date(v) : undefined),
  categoria: z.string().min(1).default('Produtos Pets'),
  descricaoSimples: z.string().optional(),
  totalManual: z.number().min(0).optional(),
  obs: z.string().optional(),
  itens: z.array(CompraItemSchema).default([]),
})

export const UpdateCompraSchema = z.object({
  fornecedor: z.string().min(1).optional(),
  dataPedido: z.string().date().optional().transform((v) => v ? new Date(v) : undefined),
  categoria: z.string().min(1).optional(),
  descricaoSimples: z.string().optional(),
  totalManual: z.number().min(0).optional(),
  obs: z.string().optional(),
  itens: z.array(CompraItemSchema).optional(),
})

export const UpdateCompraStatusSchema = z.object({
  acao: z.enum(['confirmar', 'receber', 'cancelar']),
})

export const ListComprasQuerySchema = z.object({
  status: z.enum(['pendente', 'confirmado', 'recebido', 'cancelado']).optional(),
  categoria: z.string().optional(),
  fornecedor: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
