export type OrcamentoStatus = "pendente" | "aprovado" | "recusado";

export interface OrcamentoItem {
  id: string;
  produtoId: string | null;
  nome: string;
  qtd: number;
  valorUnitario: number;
  total: number;
}

export interface Orcamento {
  id: string;
  data: string;
  validade: string;
  clienteId: string;
  cliente?: { nome: string };
  animalId: string | null;
  animal?: { nome: string } | null;
  status: OrcamentoStatus;
  total: number;
  obs: string | null;
  vendaId: string | null;
  createdAt: string;
  updatedAt: string;
  itens: OrcamentoItem[];
}
