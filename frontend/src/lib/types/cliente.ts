export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  cpf: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string;
  obs: string | null;
  numeroDeAnimais: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnimalSummary {
  id: string;
  nome: string;
  especie: string;
  raca: string | null;
  sexo: string;
  nascimento: string | null;
  peso: number | null;
}

export interface VendaSummary {
  id: string;
  data: string;
  formaPag: string;
  total: number;
  animalId: string | null;
  obs: string | null;
}

export interface ClienteDetail extends Cliente {
  animais: AnimalSummary[];
  vendas: VendaSummary[];
}
