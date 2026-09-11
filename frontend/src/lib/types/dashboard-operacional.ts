import type { Urgencia } from "./recompra";

export interface RecompraAlertaResumo {
  clienteId: string;
  clienteNome: string;
  animalNome?: string;
  produtoId: string;
  produtoNome: string;
  ultimaCompra: string;
  diasRestantes: number;
  urgencia: Urgencia;
}

export interface ClienteSumido {
  clienteId: string;
  nome: string;
  produtoNome: string;
  diasAtraso: number;
}

export interface VendaMargemNegativa {
  vendaId: string;
  numero: number;
  data: string;
  clienteNome: string;
  total: number;
  custo: number;
  margem: number;
}

export interface ProdutoEstoqueBaixo {
  produtoId: string;
  nome: string;
  categoria: string;
  estoqueAtual: number;
  estoqueMinimo: number;
}

export interface ComparativoItem {
  atual: number;
  anterior: number;
  variacaoPercentual: number | null;
}

export interface DashboardOperacional {
  recompraSemana: { total: number; itens: RecompraAlertaResumo[] };
  recompraAtrasada: { total: number; itens: RecompraAlertaResumo[] };
  clientesSumidos: { total: number; itens: ClienteSumido[] };
  faturamento: { hoje: number; periodoAtual: ComparativoItem };
  vendasMargemNegativa: VendaMargemNegativa[];
  estoqueBaixo: ProdutoEstoqueBaixo[];
}
