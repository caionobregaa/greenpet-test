import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopProdutosChart } from "@/components/dashboard/top-produtos-chart";

describe("TopProdutosChart", () => {
  it("mostra a mensagem de vazio quando não há produtos", () => {
    render(<TopProdutosChart produtos={[]} />);
    expect(screen.getByText("Nenhum dado no período")).toBeInTheDocument();
  });

  it("renderiza o título do card", () => {
    render(<TopProdutosChart produtos={[]} />);
    expect(screen.getByText("Top Produtos")).toBeInTheDocument();
  });

  it("não quebra ao renderizar com dados (eixo X só com números inteiros)", () => {
    render(
      <TopProdutosChart
        produtos={[
          { produtoId: "1", nome: "Ração Premium", totalVendido: 3200, quantidade: 12 },
          { produtoId: "2", nome: "Petisco X", totalVendido: 450, quantidade: 3 },
        ]}
      />
    );
    expect(screen.queryByText("Nenhum dado no período")).not.toBeInTheDocument();
  });
});
