import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LojaShell, ProdutosIndisponiveis } from "@/components/loja-shell";
import { CatalogoCliente } from "@/components/catalogo-cliente";
import { ProdutoCard } from "@/components/produto-card";
import type { ProdutoCatalogo } from "@/lib/catalogo";

const RACAO: ProdutoCatalogo = { id: "r1", nome: "Ração X 15kg", categoria: "Ração", especie: "Cão", valorVenda: 100, imagemUrl: "/api/v1/catalogo/produtos/r1/imagem?v=5" };
const PETISCO: ProdutoCatalogo = { id: "p1", nome: "Petisco Y", categoria: "Petisco", especie: "Gato", valorVenda: 20, imagemUrl: null };
const REMEDIO: ProdutoCatalogo = { id: "m1", nome: "Antipulgas Z", categoria: "Medicamento", especie: "Cão e Gato", valorVenda: 30, imagemUrl: null };
const PRODUTOS = [RACAO, PETISCO, REMEDIO];

function renderLoja(produtos: ProdutoCatalogo[] | null = PRODUTOS) {
  return render(
    <LojaShell produtos={produtos}>
      {produtos ? <CatalogoCliente produtos={produtos} /> : <ProdutosIndisponiveis />}
    </LojaShell>,
  );
}

async function preencher(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Nome do cliente"), "Maria Silva");
  await user.type(screen.getByLabelText("Telefone"), "92999990000");
  await user.click(screen.getByLabelText("Ambos"));
  await user.type(screen.getByLabelText("Endereço"), "Rua A, 123");
  await user.click(screen.getByLabelText("PIX"));
}

describe("Cartão de produto", () => {
  it("mostra foto do próprio site, nome e preço", () => {
    renderLoja();
    expect(screen.getByRole("img", { name: RACAO.nome })).toHaveAttribute("src", "/imagens/produtos/r1?v=5");
    expect(screen.getByRole("heading", { name: RACAO.nome })).toBeInTheDocument();
    expect(screen.getByText("R$ 100,00")).toBeInTheDocument();
  });

  it("produto sem foto usa a arte do mascote, e foto quebrada também", () => {
    const { container } = renderLoja([PETISCO, RACAO]);
    expect(container.querySelector('img[src="/brand/mascote.png"]')).toBeInTheDocument();
    fireEvent.error(screen.getByRole("img", { name: RACAO.nome }));
    expect(screen.queryByRole("img", { name: RACAO.nome })).not.toBeInTheDocument();
    expect(container.querySelectorAll('img[src="/brand/mascote.png"]')).toHaveLength(2);
  });

  it("não mostra estoque nem dados internos", () => {
    const { container } = renderLoja();
    expect(container.textContent).not.toMatch(/estoque|custo|margem|fornecedor/i);
  });

  it("usar o carrinho fora do provider é um erro claro", () => {
    const erro = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ProdutoCard produto={RACAO} />)).toThrow("CarrinhoProvider");
    erro.mockRestore();
  });
});

describe("Carrinho", () => {
  it("adicionar soma na barra, troca o botão pelo seletor e grava só id e quantidade", async () => {
    const user = userEvent.setup();
    renderLoja();
    expect(screen.queryByRole("button", { name: "Ver carrinho" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: `Adicionar ${RACAO.nome}` }));
    await user.click(screen.getByRole("button", { name: `Aumentar ${RACAO.nome}` }));
    expect(screen.getByRole("button", { name: "Ver carrinho" })).toBeInTheDocument();
    expect(screen.getByText("2 itens")).toBeInTheDocument();
    expect(screen.getByText("R$ 200,00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir carrinho, 2 itens" })).toBeInTheDocument();
    expect(localStorage.getItem("beezpet:carrinho")).toBe('{"r1":2}');

    await user.click(screen.getByRole("button", { name: `Diminuir ${RACAO.nome}` }));
    expect(screen.getByText("1 item")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: `Diminuir ${RACAO.nome}` }));
    expect(screen.getByRole("button", { name: `Adicionar ${RACAO.nome}` })).toBeInTheDocument();
  });

  it("restaura o carrinho salvo, com o preço atual", () => {
    localStorage.setItem("beezpet:carrinho", '{"r1":3}');
    renderLoja();
    expect(screen.getByText("R$ 300,00")).toBeInTheDocument();
  });

  it("item que saiu do catálogo é removido com aviso", () => {
    localStorage.setItem("beezpet:carrinho", '{"sumiu":1,"r1":1}');
    renderLoja();
    expect(screen.getByRole("status")).toHaveTextContent("Um item saiu do catálogo");
    expect(localStorage.getItem("beezpet:carrinho")).toBe('{"r1":1}');
  });

  it("aviso no plural quando saem vários", () => {
    localStorage.setItem("beezpet:carrinho", '{"a":1,"b":1}');
    renderLoja();
    expect(screen.getByRole("status")).toHaveTextContent("2 itens saíram");
  });

  it("falha da API não apaga o carrinho e mostra o WhatsApp", () => {
    localStorage.setItem("beezpet:carrinho", '{"r1":2}');
    renderLoja(null);
    expect(screen.getByRole("alert")).toHaveTextContent("Não conseguimos carregar os produtos");
    expect(within(screen.getByRole("alert")).getByRole("link")).toHaveAttribute("href", expect.stringContaining("wa.me/5592984703686"));
    expect(localStorage.getItem("beezpet:carrinho")).toBe('{"r1":2}');
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("carrinho vazio aberto pelo topo mostra orientação", async () => {
    const user = userEvent.setup();
    renderLoja();
    await user.click(screen.getByRole("button", { name: "Abrir carrinho, 0 itens" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Seu carrinho está vazio");
    expect(screen.queryByRole("button", { name: /Enviar pedido/ })).not.toBeInTheDocument();
  });
});

describe("Envio pelo WhatsApp", () => {
  const abrirJanela = vi.fn();

  beforeEach(() => {
    abrirJanela.mockReset();
    vi.stubGlobal("open", abrirJanela);
    localStorage.setItem("beezpet:carrinho", '{"r1":1}');
  });

  afterEach(() => vi.unstubAllGlobals());

  async function abrirCarrinho() {
    const user = userEvent.setup();
    renderLoja();
    await user.click(screen.getByRole("button", { name: "Ver carrinho" }));
    return user;
  }

  it("bloqueia o envio e aponta os cinco campos sem preencher", async () => {
    const user = await abrirCarrinho();
    await user.click(screen.getByRole("button", { name: /Enviar pedido/ }));
    expect(abrirJanela).not.toHaveBeenCalled();
    for (const erro of ["Informe seu nome", "Informe o telefone com DDD", "Escolha uma opção", "Informe o endereço", "Escolha a forma de pagamento"]) {
      expect(screen.getByText(erro)).toBeInTheDocument();
    }
    expect(screen.getByLabelText("Nome do cliente")).toHaveAttribute("aria-invalid", "true");
  });

  it("corrigir o campo tira o aviso dele", async () => {
    const user = await abrirCarrinho();
    await user.click(screen.getByRole("button", { name: /Enviar pedido/ }));
    await user.type(screen.getByLabelText("Nome do cliente"), "M");
    expect(screen.queryByText("Informe seu nome")).not.toBeInTheDocument();
  });

  it("telefone sem DDD não envia", async () => {
    const user = await abrirCarrinho();
    await preencher(user);
    await user.clear(screen.getByLabelText("Telefone"));
    await user.type(screen.getByLabelText("Telefone"), "99999");
    await user.click(screen.getByRole("button", { name: /Enviar pedido/ }));
    expect(abrirJanela).not.toHaveBeenCalled();
  });

  it("com tudo válido abre o WhatsApp com pedido e dados, e não grava dados pessoais", async () => {
    const user = await abrirCarrinho();
    await preencher(user);
    expect(screen.getByLabelText("Telefone")).toHaveValue("(92) 99999-0000");
    await user.click(screen.getByRole("button", { name: /Enviar pedido/ }));

    const url = new URL(abrirJanela.mock.calls[0][0]);
    expect(url.pathname).toBe("/5592984703686");
    const texto = url.searchParams.get("text")!;
    expect(texto).toContain("1x Ração X 15kg — R$ 100,00");
    expect(texto).toContain("Nome: Maria Silva");
    expect(texto).toContain("Telefone: (92) 99999-0000");
    expect(texto).toContain("Pet: Ambos");
    expect(texto).toContain("Endereço: Rua A, 123");
    expect(texto).toContain("Pagamento: PIX");
    expect(JSON.stringify({ ...localStorage })).not.toContain("Maria");
    expect(screen.getByText("Pedido pronto no WhatsApp")).toBeInTheDocument();
    expect(screen.getByText(/Respondemos das 8h às 17h/)).toBeInTheDocument();
    // Não limpa sozinho: o cliente pode não ter concluído o envio no WhatsApp.
    expect(localStorage.getItem("beezpet:carrinho")).toBe('{"r1":1}');
  });

  it("depois de enviar, dá para voltar ao pedido ou concluir e limpar", async () => {
    const user = await abrirCarrinho();
    await preencher(user);
    await user.click(screen.getByRole("button", { name: /Enviar pedido/ }));
    await user.click(screen.getByRole("button", { name: "Voltar ao pedido" }));
    expect(screen.getByLabelText("Nome do cliente")).toHaveValue("Maria Silva");
    await user.click(screen.getByRole("button", { name: /Enviar pedido/ }));
    await user.click(screen.getByRole("button", { name: "Concluir e limpar carrinho" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(localStorage.getItem("beezpet:carrinho")).toBe("{}");
  });

  it("mostra o aviso de entrega conforme o total", async () => {
    await abrirCarrinho();
    expect(screen.getByText("Entrega grátis neste pedido")).toBeInTheDocument();
    expect(screen.getByText("Entregamos somente em Manaus, em toda a cidade.")).toBeInTheDocument();
    expect(screen.getByLabelText("Endereço")).toHaveAttribute("placeholder", expect.stringContaining("Manaus"));
  });

  it("remover o último item mostra o carrinho vazio", async () => {
    const user = await abrirCarrinho();
    await user.click(screen.getByRole("button", { name: `Remover ${RACAO.nome}` }));
    expect(screen.getByRole("dialog")).toHaveTextContent("Seu carrinho está vazio");
  });

  it("medicamento no carrinho mostra o aviso de receita", async () => {
    localStorage.setItem("beezpet:carrinho", '{"m1":1}');
    const user = userEvent.setup();
    renderLoja();
    expect(screen.getByRole("heading", { name: "Medicamento" }).parentElement!.nextElementSibling).toHaveTextContent("exige receita");
    await user.click(screen.getByRole("button", { name: "Ver carrinho" }));
    expect(within(screen.getByRole("dialog")).getByText(/exige receita/)).toBeInTheDocument();
    expect(screen.getByText(/Faltam R\$ 50,00/)).toBeInTheDocument();
  });

  it("Esc e o botão fechar fecham a gaveta e liberam a rolagem", async () => {
    const user = await abrirCarrinho();
    expect(document.body.style.overflow).toBe("hidden");
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");

    await user.click(screen.getByRole("button", { name: "Ver carrinho" }));
    await user.click(screen.getByRole("button", { name: "Fechar" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("Catálogo", () => {
  it("agrupa nas seções da ordem oficial", () => {
    renderLoja();
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["Ração", "Petisco", "Medicamento"]);
    expect(screen.getAllByText("1 produto")).toHaveLength(3);
  });

  it("busca, filtra por categoria e por espécie", async () => {
    const user = userEvent.setup();
    renderLoja();
    await user.type(screen.getByRole("searchbox"), "racao");
    expect(screen.queryByRole("heading", { name: PETISCO.nome })).not.toBeInTheDocument();
    await user.clear(screen.getByRole("searchbox"));

    await user.click(screen.getByRole("button", { name: "Petisco" }));
    expect(screen.queryByRole("heading", { name: RACAO.nome })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Todas" }));

    await user.click(screen.getByRole("button", { name: "Gato" }));
    expect(screen.queryByRole("heading", { name: RACAO.nome })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: REMEDIO.nome })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Gato" }));
    expect(screen.getByRole("heading", { name: RACAO.nome })).toBeInTheDocument();
  });

  it("sem resultado mostra orientação", async () => {
    const user = userEvent.setup();
    renderLoja();
    await user.type(screen.getByRole("searchbox"), "xyz");
    expect(screen.getByText("Nenhum produto encontrado")).toBeInTheDocument();
  });

  it("abre já filtrado pela categoria do link, ignorando categoria desconhecida", () => {
    const { unmount } = render(
      <LojaShell produtos={PRODUTOS}>
        <CatalogoCliente produtos={PRODUTOS} categoriaInicial="Petisco" />
      </LojaShell>,
    );
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["Petisco"]);
    unmount();
    render(
      <LojaShell produtos={PRODUTOS}>
        <CatalogoCliente produtos={PRODUTOS} categoriaInicial="Inexistente" />
      </LojaShell>,
    );
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(3);
  });
});

describe("Topo e rodapé", () => {
  it("traz contatos oficiais e nenhum link para o sistema interno", () => {
    const { container } = renderLoja();
    expect(screen.getByRole("link", { name: /Instagram @beezpetbr/ })).toHaveAttribute("href", "https://instagram.com/beezpetbr");
    expect(screen.getByText(/WhatsApp \(92\) 98470-3686/)).toBeInTheDocument();
    expect(screen.getByText(/CNPJ 65\.788\.498/)).toBeInTheDocument();
    expect(container.innerHTML).not.toContain("app.beezpet");
    expect(container.innerHTML).not.toContain("greenpet");
  });

  it("deixa claro que é loja online: horário, dados da empresa e nada de visita ou mapa", () => {
    const { container } = renderLoja();
    expect(screen.getByText("Atendimento das 8h às 17h")).toBeInTheDocument();
    expect(screen.getByText("Dados da empresa")).toBeInTheDocument();
    expect(screen.getByText("L C DO N AMORIM NETA")).toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/maps|Ver no mapa|Passa aqui|Tudo pro seu pet|veterin|100% online|Duque de Caxias|69020/i);
  });

  it("topo e rodapé levam para a página da marca, e o rodapé traz a frase principal", () => {
    renderLoja();
    const links = screen.getAllByRole("link", { name: /A marca|Conheça a marca/ });
    expect(links.length).toBeGreaterThanOrEqual(2);
    for (const link of links) expect(link).toHaveAttribute("href", "/a-marca");
    expect(screen.getByText("Produtos que fazem sentido de verdade para a rotina do seu pet.")).toBeInTheDocument();
  });

});
