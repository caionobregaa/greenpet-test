import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProdutoForm } from "@/components/produtos/produto-form";

// specs/produtos/spec-v5.md — variação de uma distribuidora oficial vira a oficial

async function adicionar(nome: string) {
  const user = userEvent.setup();
  render(<ProdutoForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
  await user.click(screen.getByTitle("Nome da nova distribuidora"));
  await user.type(screen.getByPlaceholderText("Nome da nova distribuidora"), `${nome}{Enter}`);
  return screen.getByRole("option", { name: "Selecione a distribuidora..." }).closest("select") as HTMLSelectElement;
}

describe("ProdutoForm — distribuidora", () => {
  beforeEach(() => localStorage.clear());

  it("adicionar uma variação seleciona a oficial, sem criar opção repetida", async () => {
    const select = await adicionar("zoo center");
    expect(select.value).toBe("ZOOCENTER");
    expect(screen.queryByRole("option", { name: "zoo center" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("option", { name: "ZOOCENTER" })).toHaveLength(1);
    expect(localStorage.getItem("beezpet:distribuidoras")).toBeNull();
  });

  it("distribuidora realmente nova continua sendo adicionada", async () => {
    const select = await adicionar("Nova Dist");
    expect(select.value).toBe("Nova Dist");
    expect(JSON.parse(localStorage.getItem("beezpet:distribuidoras")!)).toEqual(["Nova Dist"]);
  });
});
