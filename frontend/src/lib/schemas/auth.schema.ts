import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
