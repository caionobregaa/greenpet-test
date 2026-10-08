import { describe, it, expect } from "vitest";
import {
  OPCOES_PAGAMENTO,
  OPCOES_PAGAMENTO_ORCAMENTO,
  opcaoDaVenda,
  VALUE_TAXA_REGISTRADA,
} from "@/lib/utils/formas-pagamento";

const resumo = (opcoes: typeof OPCOES_PAGAMENTO) => opcoes.map((o) => [o.label, o.backend, o.taxa]);

describe("formas de pagamento (specs/vendas/spec-v2.md)", () => {
  it("tabela nova: PIX/Dinheiro sem taxa, Débito 0,88%, Crédito 1x/2x/3x", () => {
    expect(resumo(OPCOES_PAGAMENTO)).toEqual([
      ["PIX", "Pix", 0],
      ["Dinheiro", "Dinheiro", 0],
      ["Débito (0,88%)", "Cartão Débito", 0.88],
      ["Crédito 1x (3,16%)", "Cartão Crédito", 3.16],
      ["Crédito 2x (4,84%)", "Cartão Crédito", 4.84],
      ["Crédito 3x (5,42%)", "Cartão Crédito", 5.42],
    ]);
  });

  it("orçamento oferece as mesmas opções e mais Boleto sem taxa", () => {
    expect(OPCOES_PAGAMENTO_ORCAMENTO.slice(0, -1)).toEqual(OPCOES_PAGAMENTO);
    expect(resumo(OPCOES_PAGAMENTO_ORCAMENTO).at(-1)).toEqual(["Boleto", "Boleto", 0]);
  });

  it("venda com taxa da tabela nova seleciona a opção correspondente", () => {
    expect(opcaoDaVenda("Cartão Crédito", 4.84).value).toBe("credito-2x");
    expect(opcaoDaVenda("Cartão Débito", 0.88).value).toBe("cartao-debito");
    expect(opcaoDaVenda("Pix", 0).value).toBe("pix");
  });

  it("venda antiga mantém a taxa registrada", () => {
    const credito = opcaoDaVenda("Cartão Crédito", 4.2);
    expect(credito).toMatchObject({ value: VALUE_TAXA_REGISTRADA, backend: "Cartão Crédito", taxa: 4.2 });
    expect(credito.label).toBe("Cartão Crédito — taxa registrada (4,2%)");

    expect(opcaoDaVenda("Cartão Débito", 1.37)).toMatchObject({ value: VALUE_TAXA_REGISTRADA, taxa: 1.37 });
  });
});
