import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DiagnosticoEstoquePage from "@/app/(app)/estoque/diagnostico/page";

// specs/estoque/spec-v2.md — diagnóstico e correção retroativa

const correcao = vi.fn();
const refetch = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/lib/hooks/use-estoque", () => ({
  useDiagnosticoEstoque: () => ({
    isLoading: false,
    refetch,
    data: {
      itensSemProduto: [{ vendaId: "v1", vendaNumero: 1, vendaData: "2026-10-01", nome: "Banho e tosa", qtd: 1 }],
      baixasIncompletas: [{ vendaId: "v2", vendaNumero: 2, vendaData: "2026-10-02", produtoId: "p1", produtoNome: "Ração A", qtd: 3, qtdBaixada: 1 }],
      produtosDuplicados: [{ nome: "Areia 4kg", produtos: [
        { id: "a", nome: "Areia 4kg", sku: "ARE-0001", estoque: 2 },
        { id: "b", nome: "areia 4kg", sku: "ARE-0002", estoque: 0 },
      ] }],
      pendentesCorrecao: { itens: 4, unidades: 9 },
    },
  }),
  useCorrecaoRetroativa: () => ({ mutateAsync: correcao, isPending: false }),
}));

const resultado = (aplicado: boolean) => ({
  aplicado,
  itens: [{ vendaId: "v9", vendaNumero: 9, vendaData: "2026-05-01", produtoId: "p1", produtoNome: "Ração Antiga", qtd: 3, qtdBaixada: 2 }],
  totalItens: 1,
  totalUnidades: 2,
});

describe("Diagnóstico do estoque", () => {
  beforeEach(() => {
    correcao.mockReset();
  });

  it("mostra pendentes, baixas incompletas, itens sem produto e nomes repetidos", () => {
    render(<DiagnosticoEstoquePage />);
    expect(screen.getByText(/item\(ns\) pendente/)).toHaveTextContent("4 item(ns) pendente(s), 9 unidade(s)");
    expect(screen.getByText("vendido 3, tirado 1")).toBeInTheDocument();
    expect(screen.getByText("Banho e tosa")).toBeInTheDocument();
    expect(screen.getByText("ARE-0002")).toBeInTheDocument();
  });

  it("simular mostra o que vai mudar sem aplicar; aplicar pede confirmação", async () => {
    const user = userEvent.setup();
    correcao.mockResolvedValueOnce(resultado(false)).mockResolvedValueOnce(resultado(true));
    render(<DiagnosticoEstoquePage />);

    await user.click(screen.getByRole("button", { name: /Simular correção/ }));
    expect(correcao).toHaveBeenLastCalledWith(false);
    expect(await screen.findByText(/nada foi alterado/)).toBeInTheDocument();
    expect(screen.getByText("Ração Antiga")).toBeInTheDocument();
    expect(screen.getByText(/Onde não havia estoque na data da venda/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Aplicar correção" }));
    const confirmar = await screen.findAllByRole("button", { name: "Aplicar correção" });
    await user.click(confirmar[confirmar.length - 1]);
    expect(correcao).toHaveBeenLastCalledWith(true);
    expect(refetch).toHaveBeenCalled();
  });
});
