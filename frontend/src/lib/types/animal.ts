export type Especie = "Cão" | "Gato";
export type Sexo = "M" | "F" | "Indefinido";

export interface Animal {
  id: string;
  nome: string;
  clienteId: string;
  cliente?: { nome: string };
  especie: Especie;
  raca: string | null;
  sexo: Sexo;
  nascimento: string | null;
  peso: number | null;
  obs: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
