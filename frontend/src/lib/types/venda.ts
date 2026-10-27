import type { AvisoEstoque } from "@/lib/types/estoque";

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
  brinde?: boolean;
}

/** Recebimento posterior do valor em aberto (specs/vendas/spec-v6.md). */
export interface VendaPagamento {
  id: string;
  valor: number;
  data: string;
  formaPag: FormaPag;
  obs?: string | null;
}

/** Venda com valor em aberto, para a lista de cobrança (GET /vendas/em-aberto). */
export interface VendaEmAberto {
  vendaId: string;
  vendaNumero: number;
  vendaData: string;
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  total: number;
  valorPago: number;
  valorEmAberto: number;
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
  lucroBruto?: number;
  obs: string | null;
  createdAt: string;
  itens: VendaItem[];
  /** Pago no ato da venda. */
  valorRecebido?: number;
  /** Pago no ato + recebimentos posteriores. */
  valorPago?: number;
  /** O que o cliente ainda deve. */
  valorEmAberto?: number;
  pagamentos?: VendaPagamento[];
  /** Na resposta de criar/editar: itens vendidos com estoque insuficiente (estoque/spec-v2). */
  avisosEstoque?: AvisoEstoque[];
}
