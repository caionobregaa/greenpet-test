export type CompraStatus = "pendente" | "confirmado" | "recebido" | "cancelado";
export type CompraAcao = "confirmar" | "receber" | "cancelar";

export interface CompraItem {
  id: string;
  produtoId: string | null;
  nome: string;
  qtd: number;
  valorUnitario: number;
  total: number;
}

export interface Compra {
  id: string;
  dataPedido: string | null;
  dataRecebimento: string | null;
  fornecedor: string;
  status: CompraStatus;
  total: number;
  obs: string | null;
  createdAt: string;
  updatedAt: string;
  itens: CompraItem[];
}
