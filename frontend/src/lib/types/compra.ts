export type CompraStatus = "pendente" | "confirmado" | "recebido" | "cancelado";
export type CompraAcao = "confirmar" | "receber" | "cancelar";

export interface CompraItem {
  id: string;
  produtoId: string | null;
  nome: string;
  qtd: number;
  pesoKg: number | null;
  valorUnitario: number;
  total: number;
}

export interface Compra {
  id: string;
  dataPedido: string | null;
  dataRecebimento: string | null;
  fornecedor: string;
  categoria: string;
  descricaoSimples: string | null;
  formaPag: string | null;
  status: CompraStatus;
  total: number;
  obs: string | null;
  createdAt: string;
  updatedAt: string;
  itens: CompraItem[];
}

// Categorias padrão do sistema
export const CATEGORIAS_DESPESA_PADRAO = ["Produtos Pets", "Contas Pessoais", "Marketing"];
