export type FormaPag = "Pix" | "Dinheiro" | "Cartão Crédito" | "Cartão Débito" | "Boleto";

export interface VendaItem {
  id: string;
  produtoId: string | null;
  nome: string;
  qtd: number;
  valorUnitario: number;
  total: number;
}

export interface Venda {
  id: string;
  data: string;
  clienteId: string;
  cliente?: { nome: string };
  animalId: string | null;
  animal?: { nome: string } | null;
  formaPag: FormaPag;
  taxaCartao: number;
  taxaEntrega: number;
  total: number;
  obs: string | null;
  createdAt: string;
  itens: VendaItem[];
}
