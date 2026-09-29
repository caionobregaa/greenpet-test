import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EstoquePage from "@/app/(app)/estoque/page";
import { useEstoque } from "@/lib/hooks/use-estoque";
import type { EstoqueItem } from "@/lib/types/estoque";

vi.mock("@/lib/hooks/use-estoque", () => {
  const mutation = () => ({ mutateAsync: vi.fn(), isPending: false });
  return {
    useEstoque: vi.fn(),
    useCreateEstoqueItem: vi.fn(mutation),
    useUpdateEstoqueItem: vi.fn(mutation),
    useDeleteEstoqueItem: vi.fn(mutation),
  };
});
vi.mock("@/lib/hooks/use-produtos", () => ({
  useUpdateProduto: vi.fn(() => ({ mutateAsync: vi.fn(), isPending: false })),
}));

function item(id: string, nome: string, fornecedor: string): EstoqueItem {
  return {
    id, produtoId: id, quantidade: 2, validade: null, lote: null, precoCompra: null, obs: null, createdAt: "", updatedAt: "",
    produto: {
      id, nome, categoria: "Medicamento", especie: "Cão", fornecedor, imagemUrl: null, valorVenda: 100, valorCusto: 60,
      marca: null, sku: `MED-${id}`, codigoBarras: "789", semCodigoBarras: false,
    },
  };
}

vi.mocked(useEstoque).mockReturnValue({
  data: { data: [item("3", "Simparic 40mg", "Central Pec"), item("1", "Bravecto 500mg", "Market"), item("2", "Apoquel 16mg", "Market")], meta: { page: 1, limit: 1000, total: 3 } },
  isLoading: false,
} as unknown as ReturnType<typeof useEstoque>);

function nomesNaTela() {
  return screen.getAllByText(/mg$/).map((el) => el.textContent);
}

describe("EstoquePage", () => {
  it("carrega o estoque inteiro e lista os produtos em ordem alfabética", () => {
    render(<EstoquePage />);

    expect(vi.mocked(useEstoque)).toHaveBeenCalledWith({ limit: 1000 });
    expect(nomesNaTela()).toEqual(["Apoquel 16mg", "Bravecto 500mg", "Simparic 40mg"]);
  });

  it("filtra por distribuidora e 'Limpar filtros' zera tudo", async () => {
    render(<EstoquePage />);
    expect(screen.queryByRole("button", { name: /Limpar filtros/ })).not.toBeInTheDocument();

    await userEvent.selectOptions(screen.getByRole("combobox", { name: "Distribuidora" }), "Market");
    expect(nomesNaTela()).toEqual(["Apoquel 16mg", "Bravecto 500mg"]);

    await userEvent.click(screen.getByRole("button", { name: /Limpar filtros/ }));
    expect(nomesNaTela()).toEqual(["Apoquel 16mg", "Bravecto 500mg", "Simparic 40mg"]);
  });
});
