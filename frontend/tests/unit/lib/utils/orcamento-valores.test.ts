import { describe, it, expect } from "vitest";
import { resumoValoresOrcamento, valorBrutoItem } from "@/lib/utils/orcamento-valores";
import { gerarOrcamentoPDF } from "@/lib/utils/orcamento-pdf";
import type { Orcamento } from "@/lib/types/orcamento";

function orcamento(itens: Array<{ qtd: number; valorUnitario: number; desconto: number }>): Orcamento {
  const linhas = itens.map((i, n) => ({
    id: `i${n}`, produtoId: null, nome: `Produto ${n + 1}`, ...i,
    total: Math.max(0, i.qtd * i.valorUnitario - i.desconto),
  }));
  return {
    id: "o1", numero: 42, data: "2026-10-08", validade: "2026-10-15", clienteId: null, animalId: null,
    status: "aberto", total: linhas.reduce((s, l) => s + l.total, 0), obs: null, vendaId: null,
    formasPag: ["PIX"], createdAt: "", updatedAt: "", itens: linhas,
  };
}

describe("resumoValoresOrcamento (specs/orcamentos/spec-v3.md)", () => {
  it("valor total sem desconto, desconto e total com desconto", () => {
    const o = orcamento([
      { qtd: 2, valorUnitario: 150, desconto: 30 },
      { qtd: 1, valorUnitario: 200, desconto: 20 },
    ]);
    expect(resumoValoresOrcamento(o)).toEqual({ subtotal: 500, desconto: 50, total: 450 });
  });

  it("sem desconto: desconto zero e total igual ao valor total", () => {
    expect(resumoValoresOrcamento(orcamento([{ qtd: 3, valorUnitario: 33.33, desconto: 0 }])))
      .toEqual({ subtotal: 99.99, desconto: 0, total: 99.99 });
  });

  it("desconto nunca fica negativo", () => {
    const o = { ...orcamento([{ qtd: 1, valorUnitario: 100, desconto: 0 }]), total: 120 };
    expect(resumoValoresOrcamento(o).desconto).toBe(0);
  });

  it("valor bruto do item é preço × quantidade", () => {
    expect(valorBrutoItem({ qtd: 3, valorUnitario: 10.1 })).toBe(30.3);
  });
});

describe("PDF do orçamento", () => {
  async function textoDoPdf(o: Orcamento): Promise<string> {
    const blob = gerarOrcamentoPDF(o, null, null, undefined, { returnBlob: true }) as Blob;
    return new TextDecoder("latin1").decode(await blob.arrayBuffer());
  }

  it("com desconto mostra Valor total, Desconto e Total com desconto, e o preço cheio de cada item", async () => {
    const pdf = await textoDoPdf(orcamento([{ qtd: 2, valorUnitario: 150, desconto: 30 }]));
    expect(pdf).toContain("Valor total");
    expect(pdf).toContain("Desconto");
    expect(pdf).toContain("Total com desconto");
    expect(pdf).toContain("300,00"); // preço cheio do item e valor total
    expect(pdf).toContain("30,00");  // desconto
    expect(pdf).toContain("270,00"); // total com desconto
  });

  it("sem desconto mostra só o Total", async () => {
    const pdf = await textoDoPdf(orcamento([{ qtd: 1, valorUnitario: 80, desconto: 0 }]));
    expect(pdf).not.toContain("Total com desconto");
    expect(pdf).not.toContain("Valor total");
    expect(pdf).toContain("(Total)");
  });
});
