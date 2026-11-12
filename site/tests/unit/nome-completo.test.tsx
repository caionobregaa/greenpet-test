import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LojaShell } from "@/components/loja-shell";
import { ProdutoCard } from "@/components/produto-card";
import type { ProdutoCatalogo } from "@/lib/catalogo";

// O fim do nome traz o peso ou a gramatura: o nome aparece inteiro, com quebra de linha, sem reticências.
const LONGO: ProdutoCatalogo = {
  id: "l1",
  nome: "Ração Úmida Be Nature Day By Day Gato Adulto SABOR Atum e Sardinha com Vegetais 120g",
  categoria: "Ração Úmida", especie: "Gato", valorVenda: 26, imagemUrl: null,
};

describe("Nome do produto completo", () => {
  it("o cartão mostra o nome inteiro, sem corte por reticências", () => {
    render(<LojaShell produtos={[LONGO]}><ProdutoCard produto={LONGO} /></LojaShell>);
    const titulo = screen.getByRole("heading", { name: LONGO.nome });
    expect(titulo).toHaveTextContent("120g");
    expect(titulo.className).not.toMatch(/line-clamp|truncate|ellipsis/);
    expect(titulo.className).toContain("break-words");
  });

  it("o carrinho também mostra o nome inteiro", async () => {
    localStorage.setItem("beezpet:carrinho", '{"l1":1}');
    const user = userEvent.setup();
    render(<LojaShell produtos={[LONGO]}><div /></LojaShell>);
    await user.click(screen.getByRole("button", { name: "Ver carrinho" }));
    const nome = within(screen.getByRole("dialog")).getByText(LONGO.nome);
    expect(nome.className).not.toMatch(/line-clamp|truncate|ellipsis/);
  });
});
