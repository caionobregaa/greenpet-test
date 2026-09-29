import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DespesasPage from "@/app/(app)/compras/page";
import { useCompras } from "@/lib/hooks/use-compras";
import { mesAtual, deslocarMes } from "@/lib/utils/mes";

vi.mock("@/lib/hooks/use-compras", () => {
  const mutation = () => ({ mutateAsync: vi.fn(), isPending: false });
  return {
    useCompras: vi.fn(),
    useCompra: vi.fn(() => ({ data: undefined, isLoading: false })),
    useDeleteCompra: vi.fn(mutation),
    useCreateCompra: vi.fn(mutation),
    useUpdateCompra: vi.fn(mutation),
    useImportarEstoque: vi.fn(mutation),
  };
});

const mockedUseCompras = vi.mocked(useCompras);

describe("DespesasPage", () => {
  beforeEach(() => {
    mockedUseCompras.mockReset();
    mockedUseCompras.mockReturnValue({
      data: {
        data: [
          {
            id: "c1", dataPedido: "2026-09-10T00:00:00.000Z", dataRecebimento: null, fornecedor: "Market",
            categoria: "Produtos Pets", descricaoSimples: null, formaPag: "Pix", status: "recebido",
            total: 1200, obs: null, createdAt: "", updatedAt: "", itens: [],
          },
        ],
        meta: { page: 1, limit: 20, total: 3, totalValor: 4380.5 },
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useCompras>);
  });

  it("abre no mês atual e mostra o total somado do mês", () => {
    render(<DespesasPage />);

    expect(mockedUseCompras).toHaveBeenLastCalledWith({ mes: mesAtual(), page: 1, limit: 20 });
    expect(screen.getByTestId("total-mes").textContent?.replace(/\s/g, " ")).toBe("R$ 4.380,50");
    expect(screen.getByText(/3 despesas/)).toBeInTheDocument();
  });

  it("ao voltar um mês, busca o mês anterior a partir da página 1", async () => {
    render(<DespesasPage />);

    await userEvent.click(screen.getByRole("button", { name: "Mês anterior" }));

    expect(mockedUseCompras).toHaveBeenLastCalledWith({ mes: deslocarMes(mesAtual(), -1), page: 1, limit: 20 });
  });
});
