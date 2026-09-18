import { z } from 'zod'
import { MOTIVOS_PERDA, type MotivoPerda } from '../../domain/entities/orcamento.entity.js'

const MotivoPerdaSchema = z.enum(MOTIVOS_PERDA as [MotivoPerda, ...MotivoPerda[]])

const OrcamentoItemSchema = z.object({
  produtoId: z.string().uuid().nullable().optional().transform((v) => v ?? undefined),
  nome: z.string().min(1),
  qtd: z.coerce.number().int().positive(),
  valorUnitario: z.coerce.number().min(0),
  desconto: z.coerce.number().min(0).optional().default(0),
})

export const UpdateOrcamentoSchema = z.object({
  validade: z.string().date().transform((v) => new Date(v)).optional(),
  obs: z.string().optional(),
  itens: z.array(OrcamentoItemSchema).min(1).optional(),
  descontoRecompraAplicado: z.boolean().optional(),
  valorDescontoRecompra: z.coerce.number().min(0).optional(),
})

export const CreateOrcamentoSchema = z.object({
  clienteId: z.string().uuid().optional(),
  animalId: z.string().uuid().optional(),
  data: z.string().date().optional().transform((v) => v ? new Date(v) : undefined),
  validade: z.string().date().transform((v) => new Date(v)),
  obs: z.string().optional(),
  formasPag: z.array(z.string()).optional().default([]),
  itens: z.array(OrcamentoItemSchema).min(1),
})

export const UpdateOrcamentoStatusSchema = z
  .object({
    acao: z.enum(['fechar', 'perder', 'reabrir']),
    motivo: MotivoPerdaSchema.optional(),
  })
  .refine((d) => d.acao !== 'perder' || !!d.motivo, {
    message: 'motivo é obrigatório para a ação "perder"',
    path: ['motivo'],
  })

export const ConverterOrcamentoSchema = z.object({
  formaPag: z.enum(['Pix', 'Dinheiro', 'Cartão Crédito', 'Cartão Débito', 'Boleto']),
  taxaCartao: z.number().min(0).max(100).optional().default(0),
  taxaEntrega: z.number().min(0).optional().default(0),
  desconto: z.number().min(0).optional().default(0),
})

export const ListOrcamentosQuerySchema = z.object({
  clienteId: z.string().uuid().optional(),
  status: z.enum(['aberto', 'fechado', 'perdido']).optional(),
  motivoPerda: MotivoPerdaSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
