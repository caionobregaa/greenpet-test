import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OrcamentoPrint } from "@/components/orcamentos/orcamento-print";
import type { Orcamento } from "@/lib/types/orcamento";

function buildOrcamento(overrides: Partial<Orcamento> = {}): Orcamento {
  return {
    id: "orc-1",
    numero: 12,
    data: "2026-10-21",
    validade: "2026-10-28",
    clienteId: "cliente-1",
    cliente: { nome: "Madalena" },
    animalId: "animal-1",
    animal: { nome: "Fofinha" },
    status: "aberto",
    total: 202.69,
    obs: null,
    vendaId: null,
    formasPag: ["PIX"],
    createdAt: "2026-10-21T12:00:00.000Z",
    updatedAt: "2026-10-21T12:00:00.000Z",
    itens: [
      { id: "i1", produtoId: "p1", nome: "Ração X 2,5kg", qtd: 2, valorUnitario: 54.05, desconto: 5.41, total: 102.69 },
      { id: "i2", produtoId: "p2", nome: "Areia 4kg", qtd: 1, valorUnitario: 100, desconto: 0, total: 100 },
    ],
    ...overrides,
  };
}

describe("OrcamentoPrint (specs/orcamentos/spec-v4.md)", () => {
  it("tem o título ORÇAMENTO e largura de cupom térmico (72 mm)", () => {
    const { container } = render(<OrcamentoPrint orcamento={buildOrcamento()} />);
    expect(screen.getByText("ORÇAMENTO")).toBeInTheDocument();
    expect((container.firstChild as HTMLElement).className).toMatch(/w-\[72mm\]/);
  });

  it("mostra cliente, pet, data, validade e número do orçamento", () => {
    render(<OrcamentoPrint orcamento={buildOrcamento()} />);
    expect(screen.getByText("Cliente: Madalena")).toBeInTheDocument();
    expect(screen.getByText("Pet: Fofinha")).toBeInTheDocument();
    expect(screen.getByText("Data: 21/10/2026")).toBeInTheDocument();
    expect(screen.getByText("Validade: 28/10/2026")).toBeInTheDocument();
    expect(screen.getByText("Orçamento: #012")).toBeInTheDocument();
  });

  it("sem animal, não mostra a linha do pet", () => {
    render(<OrcamentoPrint orcamento={buildOrcamento({ animalId: null, animal: null })} />);
    expect(screen.queryByText(/Pet:/)).not.toBeInTheDocument();
  });

  it("itens com qtd × valorUnitario, Subtotal, Desconto e TOTAL", () => {
    render(<OrcamentoPrint orcamento={buildOrcamento()} />);
    expect(screen.getByText("2x Ração X 2,5kg").nextSibling).toHaveTextContent(/R\$\s?108,10/);
    expect(screen.getByText("Subtotal").nextSibling).toHaveTextContent(/R\$\s?208,10/);
    expect(screen.getByText("Desconto").nextSibling).toHaveTextContent(/−R\$\s?5,41/);
    expect(screen.getByText("TOTAL").nextSibling).toHaveTextContent(/R\$\s?202,69/);
  });

  it("sem desconto, não mostra a linha de desconto", () => {
    const orcamento = buildOrcamento({
      total: 100,
      itens: [{ id: "i2", produtoId: "p2", nome: "Areia 4kg", qtd: 1, valorUnitario: 100, desconto: 0, total: 100 }],
    });
    render(<OrcamentoPrint orcamento={orcamento} />);
    expect(screen.queryByText("Desconto")).not.toBeInTheDocument();
  });

  it("forma de pagamento: VALOR EM ABERTO", () => {
    render(<OrcamentoPrint orcamento={buildOrcamento()} />);
    expect(screen.getByText("Pagamento:").nextSibling).toHaveTextContent("VALOR EM ABERTO");
  });

  it("não usa tons de cinza", () => {
    const { container } = render(<OrcamentoPrint orcamento={buildOrcamento()} />);
    expect(container.innerHTML).not.toMatch(/text-(neutral|gray|slate|zinc|stone)-/);
  });
});

describe("OrcamentoPrint — brinde (specs/orcamentos/spec-v5.md)", () => {
  it("item brinde mostra BRINDE e fica fora do Subtotal e do Desconto", () => {
    const orcamento = buildOrcamento({
      total: 100,
      itens: [
        { id: "i1", produtoId: "p1", nome: "Areia 4kg", qtd: 1, valorUnitario: 100, desconto: 0, total: 100 },
        { id: "i2", produtoId: "p2", nome: "Petisco", qtd: 2, valorUnitario: 0, desconto: 0, total: 0, brinde: true },
      ],
    });
    render(<OrcamentoPrint orcamento={orcamento} />);
    expect(screen.getByText("2x Petisco").nextSibling).toHaveTextContent("BRINDE");
    expect(screen.getByText("Subtotal").nextSibling).toHaveTextContent(/R\$\s?100,00/);
    expect(screen.queryByText("Desconto")).not.toBeInTheDocument();
  });
});
