import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComprasPorFornecedorChart } from "@/components/dashboard/compras-por-fornecedor-chart";

describe("ComprasPorFornecedorChart", () => {
  it("mostra a mensagem de vazio quando não há compras no período", () => {
    render(<ComprasPorFornecedorChart fornecedores={[]} />);
    expect(screen.getByText("Nenhum dado no período")).toBeInTheDocument();
  });

  it("renderiza o título do card", () => {
    render(<ComprasPorFornecedorChart fornecedores={[]} />);
    expect(screen.getByText("Compras por Distribuidora")).toBeInTheDocument();
  });

  it("não quebra ao renderizar com dados (eixo escalonado em R$500)", () => {
    render(
      <ComprasPorFornecedorChart
        fornecedores={[
          { fornecedor: "DUNORTE", totalComprado: 5400, compras: 4 },
          { fornecedor: "PRIME", totalComprado: 2100, compras: 2 },
        ]}
      />
    );
    expect(screen.queryByText("Nenhum dado no período")).not.toBeInTheDocument();
  });
});
