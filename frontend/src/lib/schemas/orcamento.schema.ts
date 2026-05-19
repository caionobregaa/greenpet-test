import { z } from "zod";

export const OrcamentoItemSchema = z.object({
  produtoId: z.string().uuid().optional().nullable(),
  nome: z.string().min(1, "Nome do item é obrigatório"),
  qtd: z.number().int().min(1, "Quantidade mínima é 1"),
  valorUnitario: z.number().min(0.01, "Valor deve ser maior que zero"),
});

export const CreateOrcamentoSchema = z.object({
  clienteId: z.string().uuid("Selecione um cliente"),
  animalId: z.string().uuid().optional().nullable(),
  data: z.string().date().optional(),
  validade: z.string().date({ message: "Data de validade é obrigatória" }),
  obs: z.string().optional().or(z.literal("")),
  itens: z.array(OrcamentoItemSchema).min(1, "Adicione pelo menos um item"),
});

export const UpdateOrcamentoStatusSchema = z.object({
  acao: z.enum(["aprovar", "recusar", "reabrir"]),
});

export const ConverterOrcamentoSchema = z.object({
  formaPag: z.enum(["Pix", "Dinheiro", "Cartão Crédito", "Cartão Débito", "Boleto"]),
});

export type OrcamentoItemInput = z.infer<typeof OrcamentoItemSchema>;
export type CreateOrcamentoInput = z.infer<typeof CreateOrcamentoSchema>;
export type ConverterOrcamentoInput = z.infer<typeof ConverterOrcamentoSchema>;
