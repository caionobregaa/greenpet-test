export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  cpf: string | null;
  endereco: string | null;
  cidade: string;
  obs: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
