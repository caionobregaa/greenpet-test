import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LojaShell } from "@/components/loja-shell";
import { FaixaProdutos } from "@/components/faixa-produtos";
import type { ProdutoCatalogo } from "@/lib/catalogo";

// specs/site/spec-v5.md — faixa que desliza para o lado
const produtos: ProdutoCatalogo[] = Array.from({ length: 5 }, (_, i) => ({
  id: `p${i}`, nome: `Ração ${i}`, categoria: "Ração", especie: null, valorVenda: 10 + i, imagemUrl: null,
}));

afterEach(() => vi.restoreAllMocks());

function renderFaixa(lista = produtos) {
  return render(<LojaShell produtos={lista}><FaixaProdutos categoria="Ração" produtos={lista} /></LojaShell>);
}

describe("FaixaProdutos", () => {
  it("mostra os produtos numa lista rotulada pela categoria", () => {
    renderFaixa();
    const lista = screen.getByRole("list", { name: "Produtos de Ração" });
    expect(lista.querySelectorAll("li")).toHaveLength(5);
    expect(lista.className).toContain("overflow-x-auto");
  });

  it("as setas rolam a faixa para os dois lados", async () => {
    const user = userEvent.setup();
    const rolar = vi.fn();
    Object.defineProperty(HTMLElement.prototype, "scrollBy", { configurable: true, value: rolar });
    renderFaixa();
    const lista = screen.getByRole("list", { name: "Produtos de Ração" });
    Object.defineProperty(lista, "clientWidth", { configurable: true, value: 500 });
    await user.click(screen.getByRole("button", { name: "Avançar produtos de Ração" }));
    await user.click(screen.getByRole("button", { name: "Voltar produtos de Ração" }));
    expect(rolar.mock.calls.map((c) => c[0].left)).toEqual([400, -400]);
  });

  it("com poucos produtos não mostra setas", () => {
    renderFaixa(produtos.slice(0, 2));
    expect(screen.queryByRole("button", { name: /Avançar/ })).not.toBeInTheDocument();
  });
});
