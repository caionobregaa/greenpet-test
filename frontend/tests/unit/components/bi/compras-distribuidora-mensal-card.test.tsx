import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ComprasDistribuidoraMensalCard } from "@/components/bi/compras-distribuidora-mensal-card";
import type { ComprasDistribuidoraMensal } from "@/lib/types/bi-avancado";

const DADOS: ComprasDistribuidoraMensal = {
  meses: ["2026-08", "2026-09"],
  distribuidoras: [
    { fornecedor: "Zoo Center", total: 900, porMes: { "2026-08": 800, "2026-09": 100 } },
    { fornecedor: "Market", total: 500, porMes: { "2026-08": 0, "2026-09": 500 } },
  ],
  totaisPorMes: { "2026-08": 800, "2026-09": 600 },
};

describe("ComprasDistribuidoraMensalCard", () => {
  it("mostra a mensagem de vazio sem compras", () => {
    render(<ComprasDistribuidoraMensalCard dados={{ meses: ["2026-09"], distribuidoras: [], totaisPorMes: { "2026-09": 0 } }} />);
    expect(screen.getByText("Nenhuma compra de produtos nos últimos 6 meses")).toBeInTheDocument();
  });

  it("mostra uma coluna por mês e uma linha por distribuidora, na ordem recebida", () => {
    render(<ComprasDistribuidoraMensalCard dados={DADOS} />);
    expect(screen.getByText("ago/26")).toBeInTheDocument();
    expect(screen.getByText("set/26")).toBeInTheDocument();
    const linhas = screen.getAllByRole("row").slice(1, 3);
    expect(within(linhas[0]).getByText("Zoo Center")).toBeInTheDocument();
    expect(within(linhas[1]).getByText("Market")).toBeInTheDocument();
  });

  it("destaca a maior compra de cada mês e não destaca meses zerados", () => {
    const { container } = render(<ComprasDistribuidoraMensalCard dados={DADOS} />);
    const destacados = Array.from(container.querySelectorAll("[data-destaque]")).map((el) => el.textContent?.replace(/\s/g, " "));
    expect(destacados).toEqual(["R$ 800,00", "R$ 500,00"]);
  });

  it("mostra o total de cada mês e o total geral no rodapé", () => {
    render(<ComprasDistribuidoraMensalCard dados={DADOS} />);
    const rodape = screen.getByText("Total do mês").closest("tr")!;
    const textos = within(rodape).getAllByRole("cell").map((c) => c.textContent?.replace(/\s/g, " "));
    expect(textos).toEqual(["Total do mês", "R$ 800,00", "R$ 600,00", "R$ 1.400,00"]);
  });
});
