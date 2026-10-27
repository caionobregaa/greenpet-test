import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ValoresEmAberto, diasDesde } from "@/components/avisos/valores-em-aberto";
import { useVendasEmAberto } from "@/lib/hooks/use-vendas";

// specs/vendas/spec-v6.md — Avisos → Valores em aberto

vi.mock("@/lib/hooks/use-vendas", () => ({ useVendasEmAberto: vi.fn() }));

describe("ValoresEmAberto", () => {
  it("lista cliente, telefone, venda, quanto falta e o total a receber", () => {
    vi.mocked(useVendasEmAberto).mockReturnValue({
      isLoading: false,
      data: {
        data: [{
          vendaId: "v1", vendaNumero: 12, vendaData: "2026-10-01T12:00:00.000Z",
          clienteId: "c1", clienteNome: "Ana", clienteTelefone: "92911111111",
          total: 200, valorPago: 50, valorEmAberto: 150,
        }],
        meta: { totalEmAberto: 150 },
      },
    } as unknown as ReturnType<typeof useVendasEmAberto>);

    render(<ValoresEmAberto />);
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText(/92911111111 · Venda V00012/)).toBeInTheDocument();
    expect(screen.getByText(/Pagou R\$\s?50,00 de R\$\s?200,00/)).toBeInTheDocument();
    expect(screen.getByText(/Total a receber/)).toHaveTextContent(/R\$\s?150,00/);
    expect(screen.getByRole("link", { name: /Ver venda/ })).toHaveAttribute("href", "/vendas/v1");
  });

  it("sem valores em aberto mostra mensagem vazia", () => {
    vi.mocked(useVendasEmAberto).mockReturnValue({
      isLoading: false, data: { data: [], meta: { totalEmAberto: 0 } },
    } as unknown as ReturnType<typeof useVendasEmAberto>);
    render(<ValoresEmAberto />);
    expect(screen.getByText("Nenhum valor em aberto.")).toBeInTheDocument();
  });

  it("diasDesde conta os dias desde a data da venda", () => {
    expect(diasDesde("2026-10-01T12:00:00.000Z", "2026-10-01")).toBe(0);
    expect(diasDesde("2026-10-01T12:00:00.000Z", "2026-10-27")).toBe(26);
  });
});
