import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProdutoForm } from "@/components/produtos/produto-form";
import ProdutosPage from "@/app/(app)/produtos/page";
import { apiProdutos } from "@/lib/api/produtos";
import { CATEGORIAS_PRODUTO, ehRacao } from "@/lib/utils/produtos";
import type { Produto } from "@/lib/types/produto";

// specs/produtos/spec-v9.md
vi.mock("@/lib/api/produtos", () => ({ apiProdutos: { list: vi.fn(), get: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } }));

function produto(campos: Partial<Produto> = {}): Produto {
  return {
    id: "p1", nome: "Ração X", sku: "RAC-0001", categoria: "Ração", especie: null, subCategoria: null,
    faseDaVida: null, porte: null, sabor: null, marca: null, fornecedor: null, codigoBarras: null,
    semCodigoBarras: true, pesoEmbalagem: 1, unidadeEmbalagem: "kg", valorCusto: 5, valorVenda: 10,
    margemCartao: 0, margemImposto: 0, margemOperacao: 0, margemLucro: 0, diasRecompra: null,
    estoqueMinimo: 1, descricao: null, imagemUrl: null, ocultarCatalogo: false, estoque: 0, deletedAt: null,
    createdAt: "2026-11-04", updatedAt: "2026-11-04", ...campos,
  };
}

beforeEach(() => {
  vi.mocked(apiProdutos.list).mockReset().mockResolvedValue({ data: [], meta: { page: 1, limit: 20, total: 0 } });
});

describe("Ração Úmida", () => {
  it("é categoria do sistema, logo depois de Ração", () => {
    expect(CATEGORIAS_PRODUTO.slice(0, 2)).toEqual(["Ração", "Ração Úmida"]);
  });

  it("se comporta como ração", () => {
    expect(ehRacao("Ração")).toBe(true);
    expect(ehRacao("Ração Úmida")).toBe(true);
    expect(ehRacao("Petisco")).toBe(false);
    expect(ehRacao(undefined)).toBe(false);
  });

  it("mostra a composição do nome no cadastro", () => {
    render(<ProdutoForm produto={produto({ categoria: "Ração Úmida" })} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText("Composição do Nome (Ração)")).toBeInTheDocument();
  });
});

describe("Categorias adicionais no cadastro", () => {
  it("lista as outras categorias, sem a principal, e envia as marcadas", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProdutoForm produto={produto()} onSubmit={onSubmit} onCancel={vi.fn()} />);
    expect(screen.queryByRole("checkbox", { name: "Ração" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "Ração Úmida" }));
    await user.click(screen.getByRole("checkbox", { name: "Petisco" }));
    await user.click(screen.getByRole("checkbox", { name: "Petisco" }));
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].categoriasAdicionais).toEqual(["Ração Úmida"]);
  });

  it("abre com as adicionais já gravadas e nunca envia a principal", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProdutoForm produto={produto({ categoriasAdicionais: ["Ração", "Petisco"] })} onSubmit={onSubmit} onCancel={vi.fn()} />);
    expect(screen.getByRole("checkbox", { name: "Petisco" })).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Salvar" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].categoriasAdicionais).toEqual(["Petisco"]);
  });
});

describe("Lista de Produtos", () => {
  function renderPagina() {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(<QueryClientProvider client={qc}><ProdutosPage /></QueryClientProvider>);
  }

  it("o botão Ocultos no site filtra pelos ocultos e pode ser desligado", async () => {
    const user = userEvent.setup();
    renderPagina();
    await waitFor(() => expect(apiProdutos.list).toHaveBeenCalled());
    expect(vi.mocked(apiProdutos.list).mock.calls.at(-1)![0]).toMatchObject({ ocultos: undefined });
    const botao = screen.getByRole("button", { name: "Ocultos no site" });
    await user.click(botao);
    await waitFor(() => expect(vi.mocked(apiProdutos.list).mock.calls.at(-1)![0]).toMatchObject({ ocultos: true }));
    expect(botao).toHaveAttribute("aria-pressed", "true");
    await user.click(botao);
    await waitFor(() => expect(vi.mocked(apiProdutos.list).mock.calls.at(-1)![0]).toMatchObject({ ocultos: undefined }));
  });

  it("mostra as categorias adicionais junto da principal", async () => {
    vi.mocked(apiProdutos.list).mockResolvedValue({ data: [produto({ categoriasAdicionais: ["Ração Úmida"] })], meta: { page: 1, limit: 20, total: 1 } });
    renderPagina();
    expect(await screen.findByText("+ Ração Úmida")).toBeInTheDocument();
  });
});
