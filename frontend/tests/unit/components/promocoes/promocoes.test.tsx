import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PromocaoDialog, analisarItem } from "@/components/promocoes/promocao-dialog";
import PromocoesPage from "@/app/(app)/promocoes/page";
import { precoDeVenda } from "@/components/vendas/itens-table";
import { apiProdutos } from "@/lib/api/produtos";
import { apiPromocoes } from "@/lib/api/promocoes";
import type { Produto } from "@/lib/types/produto";
import type { Promocao } from "@/lib/types/promocao";

// specs/promocoes/spec-v1.md
vi.mock("@/lib/api/produtos", () => ({ apiProdutos: { list: vi.fn() } }));
vi.mock("@/lib/api/promocoes", () => ({
  apiPromocoes: { list: vi.fn(), create: vi.fn(), update: vi.fn(), encerrar: vi.fn(), delete: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const RACAO = { id: "r1", nome: "Ração Golden 10kg", categoria: "Ração", valorVenda: 189.9, valorCusto: 120 } as Produto;

function comQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

const promocao = (campos: Partial<Promocao>): Promocao => ({
  id: "c1", nome: "Semana do Gato", inicio: "2026-11-10", fim: "2026-11-17", situacao: "ativa",
  itens: [{ produtoId: "r1", nome: "Ração Golden 10kg", valorVenda: 189.9, valorCusto: 120, valorPromocional: 159.9, desconto: 16 }],
  ...campos,
});

beforeEach(() => {
  vi.mocked(apiProdutos.list).mockReset().mockResolvedValue({ data: [RACAO], meta: { page: 1, limit: 8, total: 1 } });
  vi.mocked(apiPromocoes.create).mockReset().mockResolvedValue(promocao({}));
});

describe("analisarItem", () => {
  it("calcula desconto e margem com o preço promocional", () => {
    expect(analisarItem({ valorVenda: 189.9, valorCusto: 120, valorPromocional: 159.9 })).toEqual({ desconto: 16, margem: 25, erro: null, margemNegativa: false });
  });

  it("aponta preço igual ou acima do normal e margem negativa", () => {
    expect(analisarItem({ valorVenda: 100, valorCusto: 50, valorPromocional: 100 }).erro).toMatch("menor que o preço normal");
    expect(analisarItem({ valorVenda: 100, valorCusto: 80, valorPromocional: 60 }).margemNegativa).toBe(true);
    expect(analisarItem({ valorVenda: 100, valorCusto: 80 })).toMatchObject({ desconto: null, margem: null });
  });
});

describe("PromocaoDialog", () => {
  async function preencher(user: ReturnType<typeof userEvent.setup>, preco: string) {
    await user.type(screen.getByLabelText("Nome da campanha *"), "Semana do Gato");
    await user.type(screen.getByLabelText("Fim *"), "2026-11-17");
    await user.type(screen.getByPlaceholderText("Buscar produto para incluir..."), "golden");
    await user.click(await screen.findByRole("button", { name: /Ração Golden 10kg/ }));
    await user.type(screen.getByPlaceholderText("R$ 0,00"), preco);
  }

  it("inclui o produto, mostra desconto e margem e salva com datas e preço", async () => {
    const user = userEvent.setup();
    const fechar = vi.fn();
    comQuery(<PromocaoDialog open onOpenChange={fechar} />);
    await user.clear(screen.getByLabelText("Início *"));
    await user.type(screen.getByLabelText("Início *"), "2026-11-10");
    await preencher(user, "15990");
    expect(screen.getByText("-16%")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Salvar promoção" }));
    await waitFor(() => expect(apiPromocoes.create).toHaveBeenCalled());
    expect(vi.mocked(apiPromocoes.create).mock.calls[0][0]).toEqual({
      nome: "Semana do Gato", inicio: "2026-11-10", fim: "2026-11-17", itens: [{ produtoId: "r1", valorPromocional: 159.9 }],
    });
    expect(fechar).toHaveBeenCalledWith(false);
  });

  it("não deixa salvar com preço maior ou igual ao normal", async () => {
    const user = userEvent.setup();
    comQuery(<PromocaoDialog open onOpenChange={vi.fn()} />);
    await preencher(user, "18990");
    expect(screen.getByText("Precisa ser menor que o preço normal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar promoção" })).toBeDisabled();
  });

  it("avisa preço abaixo do custo, mas deixa salvar", async () => {
    const user = userEvent.setup();
    comQuery(<PromocaoDialog open onOpenChange={vi.fn()} />);
    await preencher(user, "9990");
    expect(screen.getByRole("status")).toHaveTextContent("abaixo do custo");
    expect(screen.getByRole("button", { name: "Salvar promoção" })).toBeEnabled();
  });

  it("produto já incluído não pode entrar de novo, e dá para tirar", async () => {
    const user = userEvent.setup();
    comQuery(<PromocaoDialog open onOpenChange={vi.fn()} />);
    await preencher(user, "15990");
    await user.type(screen.getByPlaceholderText("Buscar produto para incluir..."), "golden");
    expect(await screen.findByRole("button", { name: /já incluído/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Tirar Ração Golden 10kg da promoção" }));
    expect(screen.getByText(/Busque e inclua os produtos/)).toBeInTheDocument();
  });

  it("editar abre com os dados da campanha", () => {
    comQuery(<PromocaoDialog open onOpenChange={vi.fn()} promocao={promocao({})} />);
    expect(screen.getByLabelText("Nome da campanha *")).toHaveValue("Semana do Gato");
    expect(screen.getByLabelText("Início *")).toHaveValue("2026-11-10");
    expect(screen.getByText("Ração Golden 10kg")).toBeInTheDocument();
  });
});

describe("PromocoesPage", () => {
  it("lista ativas primeiro, com encerrar só para não encerradas e excluir só para não ativas", async () => {
    vi.mocked(apiPromocoes.list).mockResolvedValue([
      promocao({ id: "e", nome: "Antiga", situacao: "encerrada", inicio: "2026-05-01", fim: "2026-05-10" }),
      promocao({ id: "a", nome: "Semana do Gato", situacao: "ativa" }),
      promocao({ id: "g", nome: "Black Friday", situacao: "agendada", inicio: "2026-11-24", fim: "2026-11-30" }),
    ]);
    comQuery(<PromocoesPage />);
    const cards = await screen.findAllByRole("article");
    expect(cards.map((c) => within(c).getByRole("heading").textContent)).toEqual(["Semana do Gato", "Black Friday", "Antiga"]);
    expect(within(cards[0]).getByRole("button", { name: /Encerrar agora/ })).toBeInTheDocument();
    expect(within(cards[0]).queryByRole("button", { name: /Excluir/ })).not.toBeInTheDocument();
    expect(within(cards[2]).queryByRole("button", { name: /Encerrar agora/ })).not.toBeInTheDocument();
    expect(within(cards[2]).getByRole("button", { name: "Excluir Antiga" })).toBeInTheDocument();
    expect(within(cards[0]).getByText("10/11/2026 a 17/11/2026 · 1 produto")).toBeInTheDocument();
  });

  it("encerrar agora chama a API depois da confirmação", async () => {
    const user = userEvent.setup();
    vi.mocked(apiPromocoes.list).mockResolvedValue([promocao({})]);
    vi.mocked(apiPromocoes.encerrar).mockResolvedValue(promocao({ situacao: "encerrada" }));
    comQuery(<PromocoesPage />);
    await user.click(await screen.findByRole("button", { name: /Encerrar agora/ }));
    await user.click(screen.getByRole("button", { name: "Encerrar" }));
    await waitFor(() => expect(apiPromocoes.encerrar).toHaveBeenCalledWith("c1"));
  });

  it("sem campanhas mostra orientação", async () => {
    vi.mocked(apiPromocoes.list).mockResolvedValue([]);
    comQuery(<PromocoesPage />);
    expect(await screen.findByText("Nenhuma promoção cadastrada")).toBeInTheDocument();
  });
});

describe("Preço sugerido na venda e no orçamento", () => {
  it("usa o promocional durante a campanha e o normal fora dela", () => {
    expect(precoDeVenda({ valorVenda: 189.9, promocao: { campanhaId: "c1", nome: "S", valorPromocional: 159.9, fim: "" } })).toBe(159.9);
    expect(precoDeVenda({ valorVenda: 189.9, promocao: null })).toBe(189.9);
    expect(precoDeVenda({ valorVenda: 189.9 })).toBe(189.9);
  });
});
