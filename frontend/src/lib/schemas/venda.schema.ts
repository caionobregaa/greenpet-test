import { z } from "zod";

export const VendaItemSchema = z.object({
  produtoId: z.string().uuid().optional().nullable(),
  nome: z.string().min(1, "Nome do item é obrigatório"),
  qtd: z.number().int().min(1, "Quantidade mínima é 1"),
  valorUnitario: z.number().min(0, "Valor inválido"),
  desconto: z.number().min(0).optional(),
  itemAnimalId: z.string().optional().nullable(),
  consumoDiario: z.number().int().min(1).optional().nullable(),
  recompraData: z.string().date().optional().nullable(),
});

export const CreateVendaSchema = z.object({
  clienteId: z.string().uuid("Selecione um cliente"),
  animalId: z.string().uuid().optional().nullable(),
  data: z.string().date().optional(),
  formaPag: z.enum(["Pix", "Dinheiro", "Cartão Crédito", "Cartão Débito", "Boleto"], {
    message: "Selecione a forma de pagamento",
  }),
  taxaCartao: z.number().min(0).max(100).optional(),
  taxaEntrega: z.number().min(0).optional(),
  desconto: z.number().min(0).optional(),
  obs: z.string().optional().or(z.literal("")),
  itens: z.array(VendaItemSchema).min(1, "Adicione pelo menos um item"),
});

export const UpdateVendaSchema = z.object({
  animalId: z.string().uuid().optional().nullable(),
  data: z.string().date().optional(),
  formaPag: z.enum(["Pix", "Dinheiro", "Cartão Crédito", "Cartão Débito", "Boleto"]).optional(),
  taxaCartao: z.number().min(0).max(100).optional(),
  taxaEntrega: z.number().min(0).optional(),
  desconto: z.number().min(0).optional(),
  obs: z.string().optional().or(z.literal("")),
  itens: z.array(VendaItemSchema).min(1, "Adicione pelo menos um item").optional(),
});

export type VendaItemInput = z.infer<typeof VendaItemSchema>;
export type CreateVendaInput = z.infer<typeof CreateVendaSchema>;
export type UpdateVendaInput = z.infer<typeof UpdateVendaSchema>;
