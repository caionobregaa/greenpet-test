import { z } from "zod";

export const CreateClienteSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  telefone: z.string().min(8, "Telefone inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  cpf: z.string().optional().or(z.literal("")),
  endereco: z.string().optional().or(z.literal("")),
  cidade: z.string().default("Manaus"),
  obs: z.string().optional().or(z.literal("")),
});

export const UpdateClienteSchema = CreateClienteSchema.partial();

export type CreateClienteInput = z.infer<typeof CreateClienteSchema>;
export type UpdateClienteInput = z.infer<typeof UpdateClienteSchema>;
