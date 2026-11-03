import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LojaShell } from "@/components/loja-shell";
import { CatalogoCliente } from "@/components/catalogo-cliente";
import { descontoPercentual, emPromocao, filtrarProdutos, type ProdutoCatalogo } from "@/lib/catalogo";

// specs/promocoes/spec-v1.md — promoções no site
const PROMO: ProdutoCatalogo = { id: "p1", nome: "Ração Golden 10kg", categoria: "Ração", especie: "Gato", valorVenda: 159.9, valorOriginal: 189.9, promocaoFim: "2026-11-18T03:59:59.999Z", imagemUrl: null };
const NORMAL: ProdutoCatalogo = { id: "p2", nome: "Sachê 85g", categoria: "Petisco", especie: "Gato", valorVenda: 3.9, valorOriginal: null, promocaoFim: null, imagemUrl: null };

const produtosApi = vi.hoisted(() => ({ lista: [] as ProdutoCatalogo[] }));
vi.mock("@/lib/api", () => ({ buscarProdutos: vi.fn(async () => produtosApi.lista), backendUrl: () => "" }));
const { default: HomePage } = await import("@/app/page");
const { default: CatalogoPage } = await import("@/app/catalogo/page");

afterEach(() => vi.unstubAllGlobals());

describe("regras de promoção no site", () => {
  it("reconhece produto em promoção e calcula o desconto", () => {
    expect(emPromocao(PROMO)).toBe(true);
    expect(descontoPercentual(PROMO)).toBe(16);
    expect(emPromocao(NORMAL)).toBe(false);
    expect(descontoPercentual(NORMAL)).toBe(0);
    expect(emPromocao({ valorVenda: 10, valorOriginal: 10 })).toBe(false);
  });

  it("filtro de promoções combina com os outros filtros", () => {
    expect(filtrarProdutos([PROMO, NORMAL], { promocao: true }).map((p) => p.id)).toEqual(["p1"]);
    expect(filtrarProdutos([PROMO, NORMAL], { promocao: true, categoria: "Petisco" })).toEqual([]);
  });
});

describe("cartão em promoção", () => {
  it("mostra o preço normal riscado, o promocional e o selo de desconto", () => {
    render(<LojaShell produtos={[PROMO, NORMAL]}><CatalogoCliente produtos={[PROMO, NORMAL]} /></LojaShell>);
    const cartao = screen.getByRole("heading", { name: PROMO.nome }).closest("article")!;
    expect(within(cartao).getByText("R$ 189,90").tagName).toBe("S");
    expect(within(cartao).getByText("R$ 159,90")).toBeInTheDocument();
    expect(within(cartao).getByLabelText("16% de desconto")).toHaveTextContent("-16%");
    const comum = screen.getByRole("heading", { name: NORMAL.nome }).closest("article")!;
    expect(within(comum).queryByText(/de desconto/)).not.toBeInTheDocument();
  });

  it("a mensagem do WhatsApp sai com o preço promocional", async () => {
    const abrir = vi.fn();
    vi.stubGlobal("open", abrir);
    localStorage.setItem("beezpet:carrinho", '{"p1":2}');
    const user = userEvent.setup();
    render(<LojaShell produtos={[PROMO, NORMAL]}><CatalogoCliente produtos={[PROMO, NORMAL]} /></LojaShell>);
    await user.click(screen.getByRole("button", { name: "Ver carrinho" }));
    await user.type(screen.getByLabelText("Nome do cliente"), "Ana");
    await user.type(screen.getByLabelText("Telefone"), "92999990000");
    await user.click(screen.getByLabelText("Gato"));
    await user.type(screen.getByLabelText("Endereço"), "Rua B, 1");
    await user.click(screen.getByLabelText("PIX"));
    await user.click(screen.getByRole("button", { name: /Enviar pedido/ }));
    const texto = new URL(abrir.mock.calls[0][0]).searchParams.get("text")!;
    expect(texto).toContain("2x Ração Golden 10kg — R$ 319,80");
    expect(texto).toContain("*Total estimado:* R$ 319,80");
  });

  it("quando a promoção acaba, o carrinho passa a usar o preço normal", () => {
    localStorage.setItem("beezpet:carrinho", '{"p1":1}');
    render(<LojaShell produtos={[{ ...PROMO, valorVenda: 189.9, valorOriginal: null }]}><div /></LojaShell>);
    expect(screen.getByText("R$ 189,90")).toBeInTheDocument();
  });
});

describe("filtro Promoções no catálogo", () => {
  it("aparece só quando há promoção e filtra os produtos", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<LojaShell produtos={[NORMAL]}><CatalogoCliente produtos={[NORMAL]} /></LojaShell>);
    expect(screen.queryByRole("button", { name: "Promoções" })).not.toBeInTheDocument();
    unmount();
    render(<LojaShell produtos={[PROMO, NORMAL]}><CatalogoCliente produtos={[PROMO, NORMAL]} /></LojaShell>);
    await user.click(screen.getByRole("button", { name: "Promoções" }));
    expect(screen.queryByRole("heading", { name: NORMAL.nome })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: PROMO.nome })).toBeInTheDocument();
  });

  it("o link ?promocoes abre o catálogo já filtrado", async () => {
    produtosApi.lista = [PROMO, NORMAL];
    render(await CatalogoPage({ searchParams: Promise.resolve({ promocoes: "" }) }));
    expect(screen.getByRole("button", { name: "Promoções" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByRole("heading", { name: NORMAL.nome })).not.toBeInTheDocument();
  });
});

describe("seção Promoções na página inicial", () => {
  it("aparece com os produtos em promoção e link para ver todas", async () => {
    produtosApi.lista = [PROMO, NORMAL];
    render(await HomePage());
    const secao = screen.getByRole("heading", { name: "Promoções", level: 2 }).closest("section")!;
    expect(within(secao).getByRole("heading", { name: PROMO.nome })).toBeInTheDocument();
    expect(within(secao).queryByRole("heading", { name: NORMAL.nome })).not.toBeInTheDocument();
    expect(within(secao).getByRole("link", { name: "Ver todas as promoções" })).toHaveAttribute("href", "/catalogo?promocoes");
  });

  it("some quando não há promoção ativa", async () => {
    produtosApi.lista = [NORMAL];
    render(await HomePage());
    expect(screen.queryByRole("heading", { name: "Promoções", level: 2 })).not.toBeInTheDocument();
  });
});
