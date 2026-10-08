import type { Orcamento } from "@/lib/types/orcamento";

export interface ResumoValoresOrcamento {
  /** Soma dos produtos sem desconto (preço × quantidade). */
  subtotal: number;
  /** Quanto foi descontado do subtotal. */
  desconto: number;
  /** Valor final que o cliente paga (o total do sistema). */
  total: number;
}

const centavos = (v: number) => Math.round(v * 100) / 100;

/** Valor cheio de um item, antes do desconto. */
export function valorBrutoItem(item: { qtd: number; valorUnitario: number }): number {
  return centavos(item.qtd * item.valorUnitario);
}

/**
 * Valores do orçamento para mostrar ao cliente (specs/orcamentos/spec-v3.md).
 * O desconto é a diferença entre a soma dos produtos e o total do sistema, então
 * cobre qualquer desconto aplicado (por item ou geral).
 */
export function resumoValoresOrcamento(orcamento: Pick<Orcamento, "itens" | "total">): ResumoValoresOrcamento {
  const subtotal = centavos(orcamento.itens.reduce((s, i) => s + valorBrutoItem(i), 0));
  const total = centavos(orcamento.total);
  return { subtotal, desconto: Math.max(0, centavos(subtotal - total)), total };
}
