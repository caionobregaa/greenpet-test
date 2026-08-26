import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CurvaVendaPage from "@/app/(app)/curva-venda/page";
import { useCurvaVenda } from "@/lib/hooks/use-curva-venda";

vi.mock("@/lib/hooks/use-curva-venda", () => ({
  useCurvaVenda: vi.fn(),
}));

const mockedUseCurvaVenda = vi.mocked(useCurvaVenda);

describe("CurvaVendaPage", () => {
  it("mostra os KPIs e as linhas da tabela quando os dados carregam", () => {
    mockedUseCurvaVenda.mockReturnValue({
      data: {
        data: [
          {
            produtoId: "p1",
            produtoNome: "Royal Canin Mini Adult 2,5kg",
            categoria: "Ração",
            quantidadeVendida: 120,
            receitaTotal: 15000,
            percentualReceita: 60,
            percentualAcumulado: 60,
            curva: "A",
          },
          {
            produtoId: "p2",
            produtoNome: "Petisco X",
            categoria: "Petisco",
            quantidadeVendida: 40,
            receitaTotal: 5000,
            percentualReceita: 20,
            percentualAcumulado: 80,
            curva: "A",
          },
        ],
        meta: { page: 1, limit: 20, total: 2, resumo: { A: 2, B: 0, C: 0 } },
      },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCurvaVenda>);

    render(<CurvaVendaPage />);

    expect(screen.getByText("Curva de Venda")).toBeInTheDocument();
    expect(screen.getByText("Royal Canin Mini Adult 2,5kg")).toBeInTheDocument();
    expect(screen.getByText("Petisco X")).toBeInTheDocument();
    // 2 produtos, ambos classe A -> KpiCard "Curva A" mostra 2
    expect(screen.getByText("Total de Produtos")).toBeInTheDocument();
  });

  it("mostra o estado vazio quando não há produtos no período/categoria", () => {
    mockedUseCurvaVenda.mockReturnValue({
      data: { data: [], meta: { page: 1, limit: 20, total: 0, resumo: { A: 0, B: 0, C: 0 } } },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCurvaVenda>);

    render(<CurvaVendaPage />);

    expect(screen.getByText("Nenhum produto encontrado")).toBeInTheDocument();
  });

  it("mostra o estado de erro quando a requisição falha", () => {
    mockedUseCurvaVenda.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as unknown as ReturnType<typeof useCurvaVenda>);

    render(<CurvaVendaPage />);

    expect(screen.getByText("Erro ao carregar a curva de venda")).toBeInTheDocument();
  });

  it("ordena por uma coluna ao clicar no cabeçalho, e alterna a direção ao clicar de novo", async () => {
    const user = userEvent.setup();
    mockedUseCurvaVenda.mockReturnValue({
      data: { data: [], meta: { page: 1, limit: 20, total: 0, resumo: { A: 0, B: 0, C: 0 } } },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCurvaVenda>);

    render(<CurvaVendaPage />);

    const header = screen.getByRole("button", { name: /ordenar por receita total/i });

    // 1º clique: ordena por receitaTotal, desc (padrão)
    await user.click(header);
    expect(mockedUseCurvaVenda).toHaveBeenLastCalledWith(
      expect.objectContaining({ sortBy: "receitaTotal", sortOrder: "desc", page: 1 })
    );

    // 2º clique na mesma coluna: alterna para asc
    await user.click(header);
    expect(mockedUseCurvaVenda).toHaveBeenLastCalledWith(
      expect.objectContaining({ sortBy: "receitaTotal", sortOrder: "asc", page: 1 })
    );
  });

  it("troca de coluna de ordenação reiniciando a direção para desc", async () => {
    const user = userEvent.setup();
    mockedUseCurvaVenda.mockReturnValue({
      data: { data: [], meta: { page: 1, limit: 20, total: 0, resumo: { A: 0, B: 0, C: 0 } } },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useCurvaVenda>);

    render(<CurvaVendaPage />);

    await user.click(screen.getByRole("button", { name: /ordenar por categoria/i }));
    await user.click(screen.getByRole("button", { name: /ordenar por qtd\. vendida/i }));

    expect(mockedUseCurvaVenda).toHaveBeenLastCalledWith(
      expect.objectContaining({ sortBy: "quantidadeVendida", sortOrder: "desc", page: 1 })
    );
  });
});
