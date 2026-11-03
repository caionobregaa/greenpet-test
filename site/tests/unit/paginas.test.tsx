import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ProdutoCatalogo } from "@/lib/catalogo";

// specs/site/spec-v3.md — página inicial e página da marca
const PRODUTOS: ProdutoCatalogo[] = [
  { id: "r1", nome: "Ração X 15kg", categoria: "Ração", especie: "Cão", valorVenda: 100, imagemUrl: null },
];

vi.mock("@/lib/api", () => ({ buscarProdutos: vi.fn(async () => PRODUTOS), backendUrl: () => "" }));

const { default: HomePage } = await import("@/app/page");
const { default: MarcaPage } = await import("@/app/a-marca/page");

describe("Página inicial", () => {
  it("tem a frase principal como título, a etiqueta Pet shop e a faixa nova", async () => {
    const { container } = render(await HomePage());
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Produtos que fazem sentido de verdade para a rotina do seu pet.");
    expect(screen.getByText("Pet shop online")).toBeInTheDocument();
    // Primeira dobra e faixa
    expect(screen.getAllByText("Entrega em toda Manaus").length).toBeGreaterThanOrEqual(2);
    expect(container.querySelector('img[src="/brand/mascote-entrega.webp"]')).toHaveAttribute("alt", expect.stringContaining("Beez"));
    expect(container.querySelector('img[src="/brand/mascote-brincando.webp"]')).toBeInTheDocument();
    expect(container.innerHTML).toContain("Farejado e aprovado");
    expect(container.innerHTML).not.toMatch(/veterin|100% online|Só entra aqui|Duque de Caxias/i);
    const marca = screen.getAllByRole("link", { name: "Conheça a marca" });
    expect(marca).toHaveLength(2);
    for (const link of marca) expect(link).toHaveAttribute("href", "/a-marca");
    expect(JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!)).not.toHaveProperty("address");
  });
});

describe("Página da marca", () => {
  it("mostra o título, o texto completo e o caminho para o catálogo", async () => {
    const { container } = render(await MarcaPage());
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Conheça a Beez.");
    const texto = container.textContent ?? "";
    for (const trecho of [
      "A marca Beez Pet nasce como um nome simples",
      "acompanhe sua futura expansão para diferentes experiências de cuidado e bem-estar animal",
      "como a estampa que remete à onça",
      "criando um universo próprio, reconhecível e preparado para crescer.",
    ]) expect(texto).toContain(trecho);
    expect(screen.getByRole("link", { name: "Ver catálogo" })).toHaveAttribute("href", "/catalogo");
    expect(texto).not.toMatch(/veterin/i);
    expect(container.querySelector('img[src="/brand/mascote-sentado.webp"]')).toHaveAttribute("alt", expect.stringContaining("Beez"));
  });
});
