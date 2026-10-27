import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import VendasPage from "@/app/(app)/vendas/page";

// specs/vendas/spec-v6.md — a lista de vendas marca as vendas com valor em aberto

const base = {
  clienteId: "c1", animalId: null, animal: null, formaPag: "Pix", taxaCartao: 0, taxaEntrega: 0,
  desconto: 0, total: 200, obs: null, createdAt: "", itens: [],
};

vi.mock("@/lib/hooks/use-vendas", () => ({
  useVendas: () => ({
    isLoading: false,
    data: {
      data: [
        { ...base, id: "v1", numero: 1, data: "2026-10-01", cliente: { nome: "Ana" }, valorEmAberto: 150 },
        { ...base, id: "v2", numero: 2, data: "2026-10-02", cliente: { nome: "Bia" }, valorEmAberto: 0 },
      ],
      meta: { page: 1, limit: 20, total: 2 },
    },
  }),
  useDeleteVenda: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe("Lista de vendas — valor em aberto", () => {
  it("marca só a venda com valor em aberto", () => {
    render(<VendasPage />);
    const selos = screen.getAllByText(/Em aberto/);
    expect(selos).toHaveLength(1);
    expect(selos[0]).toHaveTextContent(/R\$\s?150,00/);
    expect(selos[0].closest("tr")).toHaveTextContent("Ana");
  });
});
