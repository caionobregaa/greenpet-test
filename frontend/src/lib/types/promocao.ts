export type SituacaoPromocao = "agendada" | "ativa" | "encerrada";

export interface PromocaoItem {
  produtoId: string;
  nome: string;
  valorVenda: number;
  valorCusto: number;
  valorPromocional: number;
  desconto: number;
}

export interface Promocao {
  id: string;
  nome: string;
  /** AAAA-MM-DD, horário de Manaus */
  inicio: string;
  fim: string;
  situacao: SituacaoPromocao;
  itens: PromocaoItem[];
}

export interface SalvarPromocaoInput {
  nome: string;
  inicio: string;
  fim: string;
  itens: Array<{ produtoId: string; valorPromocional: number }>;
}

/** Campanha ativa agora, vinda nas respostas de produto (specs/promocoes/spec-v1.md). */
export interface PromocaoAtivaProduto {
  campanhaId: string;
  nome: string;
  valorPromocional: number;
  fim: string;
}
