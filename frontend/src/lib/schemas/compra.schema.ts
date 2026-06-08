import { z } from "zod";

export const FORMAS_PAG = ["Pix", "Dinheiro", "Cartão Crédito", "Cartão Débito", "Boleto"] as const;
export type FormaPag = typeof FORMAS_PAG[number];

export const CompraItemSchema = z.object({
  produtoId: z.string().uuid().optional().nullable(),
  nome: z.string().min(1, "Nome do item é obrigatório"),
  qtd: z.number().int().min(1, "Quantidade mínima é 1"),
  pesoKg: z.number().min(0).optional().nullable(),
  valorUnitario: z.number().min(0, "Valor inválido"),
});

export const CreateCompraSchema = z.object({
  fornecedor: z.string().optional().or(z.literal("")),
  dataPedido: z.string().date().optional().or(z.literal("")),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  descricaoSimples: z.string().optional().or(z.literal("")),
  formaPag: z.enum(FORMAS_PAG).optional(),
  totalManual: z.number().min(0).optional(),
  obs: z.string().optional().or(z.literal("")),
  itens: z.array(CompraItemSchema).optional(),
});

export const UpdateCompraSchema = z.object({
  fornecedor: z.string().min(1).optional(),
  dataPedido: z.string().date().optional().or(z.literal("")),
  categoria: z.string().min(1).optional(),
  descricaoSimples: z.string().optional().or(z.literal("")),
  formaPag: z.enum(FORMAS_PAG).optional(),
  totalManual: z.number().min(0).optional(),
  obs: z.string().optional().or(z.literal("")),
  itens: z.array(CompraItemSchema).optional(),
});

export const UpdateCompraStatusSchema = z.object({
  acao: z.enum(["confirmar", "receber", "cancelar"]),
});

export type CompraItemInput = z.infer<typeof CompraItemSchema>;
export type CreateCompraInput = z.infer<typeof CreateCompraSchema>;
export type UpdateCompraInput = z.infer<typeof UpdateCompraSchema>;
