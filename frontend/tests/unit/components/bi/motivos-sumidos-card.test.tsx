import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MotivosSumidosCard } from "@/components/bi/motivos-sumidos-card";

describe("MotivosSumidosCard", () => {
  it("mostra vazio sem registros", () => {
    render(<MotivosSumidosCard totalRegistros={0} motivos={[]} />);
    expect(screen.getByText("Nenhum motivo registrado no período")).toBeInTheDocument();
  });

  it("lista os motivos com quantidade e percentual, na ordem recebida", () => {
    render(
      <MotivosSumidosCard
        totalRegistros={4}
        motivos={[
          { motivo: "Preço", quantidade: 3, percentual: 75 },
          { motivo: "Mudou de cidade", quantidade: 1, percentual: 25 },
        ]}
      />,
    );
    const itens = screen.getAllByTestId("motivo-sumido").map((el) => el.textContent);
    expect(itens).toEqual(["Preço3 · 75%", "Mudou de cidade1 · 25%"]);
    expect(screen.getByText(/4 clientes avaliados/)).toBeInTheDocument();
  });
});
