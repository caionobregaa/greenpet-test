import { CreditCard, Banknote, QrCode, Wallet, FileText, type LucideIcon } from "lucide-react";

// Taxas cobradas pelo banco (specs/vendas/spec-v2.md, negociação de 10/2026). Valem
// igual para link de pagamento e maquininha. Percentual sobre o total da venda.
export const TAXAS_PAGAMENTO = {
  debito: 0.88,
  "credito-1x": 3.16,
  "credito-2x": 4.84,
  "credito-3x": 5.42,
} as const;

export type FormaPagBackend = "Pix" | "Dinheiro" | "Cartão Crédito" | "Cartão Débito" | "Boleto";

export interface OpcaoPagamento {
  value: string;
  label: string;
  backend: FormaPagBackend;
  /** Percentual descontado (0 = sem taxa). */
  taxa: number;
  Icon: LucideIcon;
}

function rotuloTaxa(taxa: number): string {
  return `${taxa.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}

export const OPCOES_PAGAMENTO: OpcaoPagamento[] = [
  { value: "pix",           label: "PIX",                                                    backend: "Pix",            taxa: 0,                               Icon: QrCode },
  { value: "dinheiro",      label: "Dinheiro",                                               backend: "Dinheiro",       taxa: 0,                               Icon: Banknote },
  { value: "cartao-debito", label: `Débito (${rotuloTaxa(TAXAS_PAGAMENTO.debito)})`,         backend: "Cartão Débito",  taxa: TAXAS_PAGAMENTO.debito,          Icon: Wallet },
  { value: "credito-1x",    label: `Crédito 1x (${rotuloTaxa(TAXAS_PAGAMENTO["credito-1x"])})`, backend: "Cartão Crédito", taxa: TAXAS_PAGAMENTO["credito-1x"], Icon: CreditCard },
  { value: "credito-2x",    label: `Crédito 2x (${rotuloTaxa(TAXAS_PAGAMENTO["credito-2x"])})`, backend: "Cartão Crédito", taxa: TAXAS_PAGAMENTO["credito-2x"], Icon: CreditCard },
  { value: "credito-3x",    label: `Crédito 3x (${rotuloTaxa(TAXAS_PAGAMENTO["credito-3x"])})`, backend: "Cartão Crédito", taxa: TAXAS_PAGAMENTO["credito-3x"], Icon: CreditCard },
];

/** Orçamento aprovado também aceita boleto. */
export const OPCOES_PAGAMENTO_ORCAMENTO: OpcaoPagamento[] = [
  ...OPCOES_PAGAMENTO,
  { value: "boleto", label: "Boleto", backend: "Boleto", taxa: 0, Icon: FileText },
];

export const VALUE_TAXA_REGISTRADA = "taxa-registrada";

/**
 * Opção de uma venda já gravada. Se a forma + taxa estão na tabela atual, devolve essa
 * opção; senão (venda de antes da tabela nova), devolve uma opção "taxa registrada" que
 * preserva a taxa original ao salvar (specs/vendas/spec-v2.md).
 */
export function opcaoDaVenda(formaPag: string, taxaCartao: number, opcoes: OpcaoPagamento[] = OPCOES_PAGAMENTO): OpcaoPagamento {
  const atual = opcoes.find((o) => o.backend === formaPag && Math.abs(o.taxa - taxaCartao) < 0.005);
  if (atual) return atual;
  const base = opcoes.find((o) => o.backend === formaPag);
  return {
    value: VALUE_TAXA_REGISTRADA,
    label: `${formaPag} — taxa registrada (${rotuloTaxa(taxaCartao)})`,
    backend: (base?.backend ?? formaPag) as FormaPagBackend,
    taxa: taxaCartao,
    Icon: base?.Icon ?? CreditCard,
  };
}
