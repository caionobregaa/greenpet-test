import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MesNavigator } from "@/components/compras/mes-navigator";
import { mesAtual, deslocarMes } from "@/lib/utils/mes";

describe("MesNavigator", () => {
  it("mostra o mês e navega para o anterior e o seguinte", async () => {
    const onChange = vi.fn();
    render(<MesNavigator mes="2026-09" onChange={onChange} />);

    expect(screen.getByText("Setembro de 2026")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Mês anterior" }));
    await userEvent.click(screen.getByRole("button", { name: "Próximo mês" }));

    expect(onChange).toHaveBeenNthCalledWith(1, "2026-08");
    expect(onChange).toHaveBeenNthCalledWith(2, "2026-10");
  });

  it("'Mês atual' só aparece fora do mês atual e volta para ele", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<MesNavigator mes={mesAtual()} onChange={onChange} />);
    expect(screen.queryByRole("button", { name: "Mês atual" })).not.toBeInTheDocument();

    rerender(<MesNavigator mes={deslocarMes(mesAtual(), -3)} onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Mês atual" }));
    expect(onChange).toHaveBeenCalledWith(mesAtual());
  });
});
