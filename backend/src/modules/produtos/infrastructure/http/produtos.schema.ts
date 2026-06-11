import { z } from 'zod'

export const CreateProdutoSchema = z.object({
  nome: z.string().min(1),
  categoria: z.enum(['Ração', 'Petisco', 'Suplemento', 'Medicamento', 'Acessório', 'Higiene', 'Serviço']),
  especie: z.enum(['Cão', 'Gato', 'Cão e Gato', 'Ambos']).optional(),
  subCategoria: z.string().optional(),
  marca: z.string().optional(),
  fornecedor: z.string().optional(),
  pesoEmbalagem: z.number().positive().optional(),
  valorCusto: z.number().min(0).default(0),
  valorVenda: z.number().min(0),
  margemCartao: z.number().min(0).default(0),
  margemImposto: z.number().min(0).default(0),
  margemOperacao: z.number().min(0).default(0),
  margemLucro: z.number().min(0).default(0),
  diasRecompra: z.number().int().positive().optional(),
  descricao: z.string().optional(),
  imagemUrl: z.string().optional().nullable(),
})

export const UpdateProdutoSchema = CreateProdutoSchema.partial()

export const ListProdutosQuerySchema = z.object({
  q: z.string().optional(),
  categoria: z.string().optional(),
  especie: z.string().optional(),
  fornecedor: z.string().optional(),
  marca: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
