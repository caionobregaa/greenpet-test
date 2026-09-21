export type CurvaClasse = "A" | "B" | "C";

export type MelhorMargemOrigem = "compra" | "custoCadastrado";

export interface CurvaVendaItem {
  produtoId: string;
  produtoNome: string;
  categoria: string;
  quantidadeVendida: number;
  receitaTotal: number;
  percentualReceita: number;
  percentualAcumulado: number;
  curva: CurvaClasse;
  melhorMargem: number;
  melhorMargemOrigem: MelhorMargemOrigem;
}

export interface CurvaVendaMeta {
  page: number;
  limit: number;
  total: number;
  resumo: Record<CurvaClasse, number>;
}

export type CurvaVendaSortField =
  | "categoria"
  | "quantidadeVendida"
  | "receitaTotal"
  | "percentualReceita"
  | "percentualAcumulado"
  | "melhorMargem";

export type SortOrder = "asc" | "desc";
