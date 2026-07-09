export type FormaPag = "Pix" | "Dinheiro" | "Cartão Crédito" | "Cartão Débito" | "Boleto";

export interface VendaItem {
  id: string;
  produtoId: string | null;
  nome: string;
  qtd: number;
  valorUnitario: number;
  desconto: number;
  total: number;
  itemAnimalId?: string | null;
  consumoDiario?: number | null;
  recompraData?: string | null;
}

export interface Venda {
  id: string;
  numero?: number;
  data: string;
  clienteId: string;
  cliente?: { nome: string };
  animalId: string | null;
  animal?: { nome: string } | null;
  formaPag: FormaPag;
  taxaCartao: number;
  taxaEntrega: number;
  desconto: number;
  total: number;
  obs: string | null;
  createdAt: string;
  itens: VendaItem[];
}
