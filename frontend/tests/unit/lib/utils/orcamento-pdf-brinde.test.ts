import { describe, it, expect, vi } from "vitest";
import autoTable from "jspdf-autotable";
import { gerarOrcamentoPDF } from "@/lib/utils/orcamento-pdf";
import { resumoValoresOrcamento, valorBrutoItem } from "@/lib/utils/orcamento-valores";
import type { Orcamento } from "@/lib/types/orcamento";

// specs/orcamentos/spec-v5.md — brinde no PDF e nas contas do orçamento

vi.mock("jspdf-autotable", () => ({
  default: vi.fn((doc: { lastAutoTable?: { finalY: number } }) => { doc.lastAutoTable = { finalY: 120 }; }),
}));

const orcamento: Orcamento = {
  id: "orc-1", numero: 12, data: "2026-10-21", validade: "2026-10-28",
  clienteId: "c1", cliente: { nome: "Ana" }, animalId: null, animal: null,
  status: "aberto", total: 95, obs: null, vendaId: null, formasPag: [],
  createdAt: "", updatedAt: "",
  itens: [
    { id: "i1", produtoId: null, nome: "Ração", qtd: 1, valorUnitario: 100, desconto: 5, total: 95 },
    { id: "i2", produtoId: null, nome: "Petisco", qtd: 2, valorUnitario: 0, desconto: 0, total: 0, brinde: true },
  ],
};

describe("Orçamento — brinde nas contas e no PDF", () => {
  it("brinde vale 0 e fica fora do Valor total e do Desconto", () => {
    expect(valorBrutoItem({ qtd: 2, valorUnitario: 15, brinde: true })).toBe(0);
    expect(resumoValoresOrcamento(orcamento)).toEqual({ subtotal: 100, desconto: 5, total: 95 });
  });

  it("PDF mostra 'Brinde' nas colunas de preço do item brinde", () => {
    gerarOrcamentoPDF(orcamento, null, null, undefined, { returnBlob: true });

    const body = vi.mocked(autoTable).mock.calls[0][1].body as string[][];
    expect(body[0][0]).toBe("Ração");
    expect(body[0][2]).toMatch(/R\$\s?100,00/);
    expect(body[1]).toEqual(["Petisco", "un.", "Brinde", "2", "Brinde"]);
  });
});
