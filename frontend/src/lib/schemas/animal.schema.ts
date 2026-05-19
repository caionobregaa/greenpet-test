import { z } from "zod";

export const CreateAnimalSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  clienteId: z.string().uuid("Selecione um cliente"),
  especie: z.enum(["Cão", "Gato"], { message: "Selecione a espécie" }),
  raca: z.string().optional().or(z.literal("")),
  sexo: z.enum(["M", "F", "Indefinido"]).default("Indefinido"),
  nascimento: z.string().date().optional().or(z.literal("")),
  peso: z.number().min(0).optional(),
  obs: z.string().optional().or(z.literal("")),
});

export const UpdateAnimalSchema = CreateAnimalSchema.partial();

export type CreateAnimalInput = z.infer<typeof CreateAnimalSchema>;
export type UpdateAnimalInput = z.infer<typeof UpdateAnimalSchema>;
