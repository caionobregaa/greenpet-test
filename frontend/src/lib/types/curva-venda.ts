export type CurvaClasse = "A" | "B" | "C";

export interface CurvaVendaItem {
  produtoId: string;
  produtoNome: string;
  categoria: string;
  quantidadeVendida: number;
  receitaTotal: number;
  percentualReceita: number;
  percentualAcumulado: number;
  curva: CurvaClasse;
}

export interface CurvaVendaMeta {
  page: number;
  limit: number;
  total: number;
  resumo: Record<CurvaClasse, number>;
}
