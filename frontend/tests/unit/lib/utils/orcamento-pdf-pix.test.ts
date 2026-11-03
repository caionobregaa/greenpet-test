import { describe, it, expect, vi } from "vitest";
import { gerarOrcamentoPDF } from "@/lib/utils/orcamento-pdf";
import type { Orcamento } from "@/lib/types/orcamento";

// specs/orcamentos/spec-v7.md — chave PIX é o CNPJ
const escritos = vi.hoisted(() => [] as string[]);

// jsPDF cria o método text em cada instância: o espião embrulha a classe real.
vi.mock("jspdf", async (importar) => {
  const Real = ((await importar()) as { default: new (...a: unknown[]) => { text: (...a: unknown[]) => unknown } }).default;
  class Espiao extends Real {
    constructor(...args: unknown[]) {
      super(...args);
      const original = this.text.bind(this);
      this.text = (...a: unknown[]) => {
        escritos.push(...[a[0]].flat().map(String));
        return original(...a);
      };
    }
  }
  return { default: Espiao, jsPDF: Espiao };
});
vi.mock("jspdf-autotable", () => ({
  default: vi.fn((doc: { lastAutoTable?: { finalY: number } }) => { doc.lastAutoTable = { finalY: 120 }; }),
}));

const orcamento: Orcamento = {
  id: "orc-1", numero: 12, data: "2026-10-21", validade: "2026-10-28",
  clienteId: "c1", cliente: { nome: "Ana" }, animalId: null, animal: null,
  status: "aberto", total: 100, obs: null, vendaId: null, formasPag: [],
  createdAt: "", updatedAt: "",
  itens: [{ id: "i1", produtoId: null, nome: "Ração", qtd: 1, valorUnitario: 100, desconto: 0, total: 100 }],
};

describe("Orçamento — chave PIX no PDF", () => {
  it("mostra o CNPJ como chave e não mostra o telefone antigo", () => {
    gerarOrcamentoPDF(orcamento, null, null, undefined, { returnBlob: true });
    expect(escritos).toContain("65.788.498/0001-44");
    expect(escritos).toContain("(chave CNPJ)");
    expect(escritos.join(" ")).not.toContain("98127-7831");
  });
});
