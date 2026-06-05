import { z } from "zod";

export const CreateProdutoSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  especie: z.string().optional().or(z.literal("")),
  subCategoria: z.string().optional().or(z.literal("")),
  marca: z.string().optional().or(z.literal("")),
  fornecedor: z.string().optional().or(z.literal("")),
  pesoEmbalagem: z.number().min(0).optional(),
  valorCusto: z.number().min(0, "Valor de custo inválido"),
  valorVenda: z.number().min(0.01, "Valor de venda deve ser maior que zero"),
  margemCartao: z.number().min(0).max(100).optional(),
  margemImposto: z.number().min(0).max(100).optional(),
  margemOperacao: z.number().min(0).max(100).optional(),
  margemLucro: z.number().min(0).max(100).optional(),
  descricao: z.string().optional().or(z.literal("")),
});

export const UpdateProdutoSchema = CreateProdutoSchema.partial();

export type CreateProdutoInput = z.infer<typeof CreateProdutoSchema>;
export type UpdateProdutoInput = z.infer<typeof UpdateProdutoSchema>;
