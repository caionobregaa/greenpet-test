export type OrcamentoStatus = "aberto" | "fechado" | "perdido";

export interface OrcamentoItem {
  id: string;
  produtoId: string | null;
  nome: string;
  qtd: number;
  valorUnitario: number;
  desconto: number;
  total: number;
}

export interface Orcamento {
  id: string;
  numero: number;
  data: string;
  validade: string;
  clienteId?: string | null;
  cliente?: { nome: string };
  animalId: string | null;
  animal?: { nome: string } | null;
  status: OrcamentoStatus;
  motivoPerda?: string | null;
  total: number;
  obs: string | null;
  vendaId: string | null;
  formasPag: string[];
  descontoRecompraAplicado?: boolean;
  valorDescontoRecompra?: number | null;
  createdAt: string;
  updatedAt: string;
  itens: OrcamentoItem[];
}
