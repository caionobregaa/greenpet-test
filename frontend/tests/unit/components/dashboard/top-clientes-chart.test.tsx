import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopClientesChart } from "@/components/dashboard/top-clientes-chart";

describe("TopClientesChart", () => {
  it("mostra a mensagem de vazio quando não há clientes", () => {
    render(<TopClientesChart clientes={[]} />);
    expect(screen.getByText("Nenhum dado no período")).toBeInTheDocument();
  });

  it("renderiza o título do card mesmo sem dados", () => {
    render(<TopClientesChart clientes={[]} />);
    expect(screen.getByText("Top Clientes")).toBeInTheDocument();
  });

  it("não quebra ao renderizar com dados (eixo escalonado em R$500)", () => {
    render(
      <TopClientesChart
        clientes={[
          { clienteId: "1", nome: "Maria Silva", totalGasto: 1234, vendas: 3 },
          { clienteId: "2", nome: "João Souza", totalGasto: 890, vendas: 2 },
        ]}
      />
    );
    expect(screen.queryByText("Nenhum dado no período")).not.toBeInTheDocument();
  });
});
