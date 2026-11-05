import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  agruparPorCategoria,
  filtrarProdutos,
  montarVitrine,
  urlDaFoto,
  type ProdutoCatalogo,
} from "@/lib/catalogo";
import {
  alterarQuantidade,
  calcularTotal,
  conciliarCarrinho,
  lerCarrinho,
  montarLinhas,
  salvarCarrinho,
} from "@/lib/carrinho";
import {
  avisoEntrega,
  mascararTelefone,
  montarMensagem,
  validarCliente,
  WHATSAPP_CONTATO_URL,
  whatsappUrl,
} from "@/lib/pedido";
import { formatBRL } from "@/lib/format";
import { backendUrl, buscarProdutos } from "@/lib/api";
import { GET } from "@/app/imagens/produtos/[id]/route";

vi.mock("next/server", async (importar) => ({
  ...(await importar<typeof import("next/server")>()),
  connection: vi.fn().mockResolvedValue(undefined),
}));

function produto(p: Partial<ProdutoCatalogo> & { id: string }): ProdutoCatalogo {
  return { nome: p.id, categoria: "Ração", especie: null, valorVenda: 10, imagemUrl: null, ...p };
}

const DADOS = { nome: " Maria Silva ", telefone: "(92) 99999-0000", pet: "Cão", endereco: " Rua A, 123 - Centro ", pagamento: "PIX" };

describe("agruparPorCategoria", () => {
  it("segue a ordem oficial e coloca categoria não prevista depois, sem perder produto", () => {
    const grupos = agruparPorCategoria([
      produto({ id: "1", categoria: "Higiene" }),
      produto({ id: "2", categoria: "Suplemento" }),
      produto({ id: "3", categoria: "Ração" }),
      produto({ id: "4", categoria: "Acessório" }),
      produto({ id: "5", categoria: "Medicamento" }),
      produto({ id: "6", categoria: "Petisco" }),
      produto({ id: "7", categoria: "Brinquedo" }),
      produto({ id: "8", categoria: "Ração" }),
    ]);
    expect(grupos.map((g) => g.categoria)).toEqual([
      "Ração", "Petisco", "Medicamento", "Acessório", "Higiene", "Brinquedo", "Suplemento",
    ]);
    expect(grupos.flatMap((g) => g.produtos)).toHaveLength(8);
  });
});

describe("montarVitrine", () => {
  // Sorteio previsível para o teste (gerador linear congruente)
  function semente(n: number) {
    let x = n;
    return () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648);
  }
  const marcas = ["Golden", "Premier", "Royal", "Fórmula Natural", "Guabi", "Biofresh", "Farmina", "Quatree", "Magnus", "Special Dog"];
  const racoes = Array.from({ length: 20 }, (_, i) =>
    produto({ id: `r${i}`, valorVenda: 10 + i * 10, imagemUrl: "/x", marca: marcas[i % 10] }),
  );

  it("traz no máximo 7 por categoria, metade barata e metade cara", () => {
    for (let n = 1; n <= 20; n++) {
      const [grupo] = montarVitrine(racoes, semente(n));
      expect(grupo.produtos).toHaveLength(7);
      const baratos = grupo.produtos.filter((p) => p.valorVenda <= 100).length;
      expect(Math.abs(baratos - (7 - baratos))).toBeLessThanOrEqual(1);
    }
  });

  it("não repete marca enquanto houver outra disponível", () => {
    for (let n = 1; n <= 20; n++) {
      const [grupo] = montarVitrine(racoes, semente(n));
      const vistas = grupo.produtos.map((p) => p.marca);
      expect(new Set(vistas).size).toBe(7);
    }
  });

  it("repete marca só quando não há outra", () => {
    const mesmaMarca = Array.from({ length: 9 }, (_, i) => produto({ id: `m${i}`, valorVenda: i + 1, marca: "Golden" }));
    expect(montarVitrine(mesmaMarca, semente(3))[0].produtos).toHaveLength(7);
  });

  it("muda a seleção entre visitas", () => {
    const seleções = new Set(Array.from({ length: 10 }, (_, n) => montarVitrine(racoes, semente(n + 1))[0].produtos.map((p) => p.id).sort().join()));
    expect(seleções.size).toBeGreaterThan(1);
  });

  it("prioriza produtos com foto quando há o bastante, e usa todos quando não há", () => {
    const semFoto = Array.from({ length: 8 }, (_, i) => produto({ id: `s${i}` }));
    const comFoto = Array.from({ length: 7 }, (_, i) => produto({ id: `f${i}`, imagemUrl: "/x" }));
    expect(montarVitrine([...semFoto, ...comFoto], semente(1))[0].produtos.every((p) => p.imagemUrl)).toBe(true);
    const poucasFotos = montarVitrine([...semFoto, comFoto[0]], semente(1))[0].produtos;
    expect(poucasFotos).toHaveLength(7);
  });

  it("categoria pequena mostra todos, sem repetir", () => {
    const [grupo] = montarVitrine([produto({ id: "a" }), produto({ id: "b", valorVenda: 99 })], semente(2));
    expect(grupo.produtos.map((p) => p.id).sort()).toEqual(["a", "b"]);
  });

  it("usa o sorteio padrão quando nenhum é informado", () => {
    expect(montarVitrine(racoes)[0].produtos).toHaveLength(7);
  });
});

describe("categorias adicionais e Ração Úmida", () => {
  it("o produto entra em cada categoria e Ração Úmida vem logo depois de Ração", () => {
    const grupos = agruparPorCategoria([
      produto({ id: "m", categoria: "Ração", categorias: ["Ração", "Ração Úmida"] }),
      produto({ id: "p", categoria: "Petisco" }),
      produto({ id: "u", categoria: "Ração Úmida" }),
    ]);
    expect(grupos.map((g) => [g.categoria, g.produtos.map((p) => p.id)])).toEqual([
      ["Ração", ["m"]],
      ["Ração Úmida", ["m", "u"]],
      ["Petisco", ["p"]],
    ]);
  });

  it("o filtro de categoria considera as adicionais", () => {
    const lista = [produto({ id: "m", categoria: "Ração", categorias: ["Ração", "Ração Úmida"] }), produto({ id: "s", categoria: "Ração" })];
    expect(filtrarProdutos(lista, { categoria: "Ração Úmida" }).map((p) => p.id)).toEqual(["m"]);
  });
});

describe("filtrarProdutos", () => {
  const lista = [
    produto({ id: "a", nome: "Ração Fórmula Natural Cão", categoria: "Ração", especie: "Cão" }),
    produto({ id: "b", nome: "Sachê Gato", categoria: "Ração", especie: "Gato" }),
    produto({ id: "c", nome: "Shampoo", categoria: "Higiene", especie: "Cão e Gato" }),
    produto({ id: "d", nome: "Coleira", categoria: "Acessório", especie: null }),
  ];
  const ids = (f: Parameters<typeof filtrarProdutos>[1]) => filtrarProdutos(lista, f).map((p) => p.id);

  it("busca ignora maiúsculas e acentos, com palavras em qualquer ordem", () => {
    expect(ids({ busca: "FORMULA racao" })).toEqual(["a"]);
    expect(ids({ busca: "sache" })).toEqual(["b"]);
    expect(ids({ busca: "inexistente" })).toEqual([]);
  });

  it("sem filtros devolve tudo", () => {
    expect(ids({})).toEqual(["a", "b", "c", "d"]);
  });

  it("filtra por categoria", () => {
    expect(ids({ categoria: "Higiene" })).toEqual(["c"]);
  });

  it("espécie inclui 'Cão e Gato' e produto sem espécie", () => {
    expect(ids({ especie: "Gato" })).toEqual(["b", "c", "d"]);
  });

  it("filtros combinam com a busca", () => {
    expect(ids({ busca: "sache", especie: "Cão" })).toEqual([]);
  });
});

describe("urlDaFoto", () => {
  it("aponta para o próprio site e mantém a versão", () => {
    expect(urlDaFoto({ id: "p1", imagemUrl: "/api/v1/catalogo/produtos/p1/imagem?v=9" })).toBe("/imagens/produtos/p1?v=9");
    expect(urlDaFoto({ id: "p1", imagemUrl: "/sem-versao" })).toBe("/imagens/produtos/p1");
  });

  it("produto sem foto devolve null", () => {
    expect(urlDaFoto({ id: "p1", imagemUrl: null })).toBeNull();
  });
});

describe("carrinho", () => {
  it("altera, limita a 99 e remove ao zerar", () => {
    let itens = alterarQuantidade({}, "a", 2);
    expect(itens).toEqual({ a: 2 });
    itens = alterarQuantidade(itens, "a", 500);
    expect(itens).toEqual({ a: 99 });
    expect(alterarQuantidade(itens, "a", 0)).toEqual({});
  });

  it("guarda só id e quantidade e lê de volta", () => {
    salvarCarrinho({ a: 2 });
    expect(localStorage.getItem("beezpet:carrinho")).toBe('{"a":2}');
    expect(lerCarrinho()).toEqual({ a: 2 });
  });

  it.each(["{invalido", "[1,2]", "null", '"texto"'])("localStorage inválido (%s) vira carrinho vazio", (salvo) => {
    localStorage.setItem("beezpet:carrinho", salvo);
    expect(lerCarrinho()).toEqual({});
  });

  it("descarta quantidades inválidas", () => {
    localStorage.setItem("beezpet:carrinho", '{"a":-1,"b":1.5,"c":"2","d":1000,"e":3}');
    expect(lerCarrinho()).toEqual({ e: 3 });
  });

  it("sem armazenamento disponível, gravar não quebra", () => {
    const espiao = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("cheio");
    });
    expect(() => salvarCarrinho({ a: 1 })).not.toThrow();
    espiao.mockRestore();
  });

  it("remove itens que saíram do catálogo e informa quantos", () => {
    expect(conciliarCarrinho({ a: 1, b: 2 }, [produto({ id: "a" })])).toEqual({ itens: { a: 1 }, removidos: 1 });
  });

  it("falha da API não mexe no carrinho", () => {
    expect(conciliarCarrinho({ a: 1 }, null)).toEqual({ itens: { a: 1 }, removidos: 0 });
  });

  it("usa o preço atual do catálogo e soma sem erro de centavos", () => {
    const linhas = montarLinhas({ a: 3, b: 1 }, [
      produto({ id: "a", valorVenda: 0.1 }),
      produto({ id: "b", valorVenda: 0.2 }),
      produto({ id: "c", valorVenda: 99 }),
    ]);
    expect(linhas.map((l) => l.subtotal)).toEqual([0.3, 0.2]);
    expect(calcularTotal(linhas)).toBe(0.5);
  });
});

describe("pedido", () => {
  it("mascara o telefone enquanto digita", () => {
    expect(mascararTelefone("")).toBe("");
    expect(mascararTelefone("9")).toBe("(9");
    expect(mascararTelefone("9298")).toBe("(92) 98");
    expect(mascararTelefone("9233334444")).toBe("(92) 3333-4444");
    expect(mascararTelefone("92999990000123")).toBe("(92) 99999-0000");
  });

  it("aceita os cinco campos válidos", () => {
    expect(validarCliente(DADOS)).toEqual({});
    expect(validarCliente({ ...DADOS, telefone: "(92) 3333-4444" })).toEqual({});
  });

  it("aponta cada campo inválido", () => {
    expect(validarCliente({ nome: " ", telefone: "(92) 999", pet: "Peixe", endereco: " ", pagamento: "Boleto" })).toEqual({
      nome: expect.any(String),
      telefone: expect.any(String),
      pet: expect.any(String),
      endereco: expect.any(String),
      pagamento: expect.any(String),
    });
  });

  it("monta a mensagem exatamente no modelo das regras, sem emoji", () => {
    const linhas = montarLinhas({ a: 2, b: 1 }, [
      produto({ id: "a", nome: "Ração X Cão Adulto 15kg", valorVenda: 189.9 }),
      produto({ id: "b", nome: "Petisco Y", valorVenda: 24.9 }),
    ]);
    const mensagem = montarMensagem(linhas, DADOS);
    expect(mensagem).toBe(
      [
        "Olá! Vim pelo site da BEEZ PET",
        "",
        "*Pedido*",
        "2x Ração X Cão Adulto 15kg — R$ 379,80",
        "1x Petisco Y — R$ 24,90",
        "*Total estimado:* R$ 404,70",
        "",
        "*Meus dados*",
        "Nome: Maria Silva",
        "Telefone: (92) 99999-0000",
        "Pet: Cão",
        "Endereço: Rua A, 123 - Centro",
        "Pagamento: PIX",
        "",
        "Pode confirmar a disponibilidade?",
      ].join("\n"),
    );
    expect(mensagem).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  it("gera o link do número oficial preservando acentos e símbolos", () => {
    const url = new URL(whatsappUrl("Ração & cão #1"));
    expect(url.origin + url.pathname).toBe("https://wa.me/5592984703686");
    expect(url.searchParams.get("text")).toBe("Ração & cão #1");
    expect(WHATSAPP_CONTATO_URL).toContain("5592984703686");
  });

  it("avisa sobre a entrega a partir de R$ 80", () => {
    expect(avisoEntrega(80)).toBe("Entrega grátis neste pedido");
    expect(avisoEntrega(79.99)).toContain("Faltam R$ 0,01");
  });

  it("formata reais com espaço comum", () => {
    expect(formatBRL(1234.5)).toBe("R$ 1.234,50");
  });
});

describe("API e fotos", () => {
  const fetchMock = vi.fn();
  const params = Promise.resolve({ id: "p/1" });
  const req = new Request("http://site/imagens/produtos/p1");

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("lê os produtos com cache de 5 minutos, no endereço configurado", async () => {
    vi.stubEnv("BACKEND_URL", "http://grenpett_backend:3001");
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ data: [produto({ id: "a" })] })));
    expect(await buscarProdutos()).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith("http://grenpett_backend:3001/api/v1/catalogo/produtos", { next: { revalidate: 300 } });
  });

  it("usa o backend local sem configuração", () => {
    expect(backendUrl()).toBe("http://localhost:3001");
  });

  it("devolve null quando a API responde erro ou não responde", async () => {
    fetchMock.mockResolvedValueOnce(new Response("", { status: 500 }));
    expect(await buscarProdutos()).toBeNull();
    fetchMock.mockRejectedValueOnce(new Error("rede"));
    expect(await buscarProdutos()).toBeNull();
  });

  it("repassa a foto com os cabeçalhos do backend e o id codificado", async () => {
    fetchMock.mockResolvedValue(new Response("foto", { headers: { "content-type": "image/jpeg", "cache-control": "public, immutable" } }));
    const res = await GET(req, { params });
    expect(fetchMock.mock.calls[0][0]).toContain("/produtos/p%2F1/imagem");
    expect(res.headers.get("content-type")).toBe("image/jpeg");
    expect(res.headers.get("cache-control")).toBe("public, immutable");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(await res.text()).toBe("foto");
  });

  it("usa cabeçalhos seguros quando o backend não informa", async () => {
    fetchMock.mockResolvedValue({ status: 200, ok: true, headers: new Headers(), arrayBuffer: async () => new ArrayBuffer(1) });
    const res = await GET(req, { params });
    expect(res.headers.get("content-type")).toBe("application/octet-stream");
    expect(res.headers.get("cache-control")).toBe("public, max-age=300");
  });

  it("segue o redirecionamento de fotos antigas", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 302, headers: { location: "https://app.beezpet.com.br/uploads/a.png" } }));
    const res = await GET(req, { params });
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toBe("https://app.beezpet.com.br/uploads/a.png");
  });

  it("responde 404 se a foto não existir e 502 se o backend falhar", async () => {
    fetchMock.mockResolvedValueOnce(new Response("", { status: 404 }));
    expect((await GET(req, { params })).status).toBe(404);
    fetchMock.mockRejectedValueOnce(new Error("rede"));
    expect((await GET(req, { params })).status).toBe(502);
  });
});
