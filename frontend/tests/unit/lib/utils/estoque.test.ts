import { describe, it, expect } from "vitest";
import { agruparEstoque, type FiltrosEstoque } from "@/lib/utils/estoque";
import type { EstoqueItem } from "@/lib/types/estoque";

let seq = 0;
function lote(nome: string, extra: Partial<EstoqueItem["produto"]> = {}): EstoqueItem {
  seq++;
  const produtoId = extra.id ?? nome;
  return {
    id: `lote-${seq}`,
    produtoId,
    produto: {
      id: produtoId,
      nome,
      categoria: "Medicamento",
      especie: "Cão",
      fornecedor: "Market",
      imagemUrl: null,
      valorVenda: 100,
      valorCusto: 60,
      marca: null,
      sku: `MED-${String(seq).padStart(4, "0")}`,
      codigoBarras: null,
      semCodigoBarras: false,
      ...extra,
    },
    quantidade: 1,
    validade: null,
    lote: null,
    precoCompra: null,
    obs: null,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
  };
}

const SEM_FILTRO: FiltrosEstoque = { busca: "", categoria: "", especie: "", fornecedor: "" };

describe("agruparEstoque", () => {
  it("agrupa por produto em ordem alfabética, ignorando acento e maiúscula", () => {
    const itens = [lote("simparic 40mg"), lote("Écran Pet"), lote("Bravecto 500mg"), lote("Bravecto 500mg"), lote("apoquel")];
    const grupos = agruparEstoque(itens, SEM_FILTRO);
    expect(grupos.map((g) => g.produto.nome)).toEqual(["apoquel", "Bravecto 500mg", "Écran Pet", "simparic 40mg"]);
    expect(grupos[1].lotes).toHaveLength(2);
  });

  it("busca por palavras em qualquer ordem, como em Produtos", () => {
    const itens = [lote("Bravecto 500mg (10 a 20kg)"), lote("Bravecto 1000mg (20 a 40kg)"), lote("Simparic 40mg")];
    const grupos = agruparEstoque(itens, { ...SEM_FILTRO, busca: "500 brav" });
    expect(grupos.map((g) => g.produto.nome)).toEqual(["Bravecto 500mg (10 a 20kg)"]);
  });

  it("combina busca com filtros de distribuidora, categoria e espécie", () => {
    const itens = [
      lote("Bravecto Cão", { fornecedor: "Market", especie: "Cão" }),
      lote("Bravecto Gato", { fornecedor: "Market", especie: "Gato" }),
      lote("Bravecto Outra", { fornecedor: "Central Pec", especie: "Cão" }),
      lote("Ração Bravecto", { fornecedor: "Market", especie: "Cão", categoria: "Ração" }),
    ];
    const grupos = agruparEstoque(itens, { busca: "bravecto", categoria: "Medicamento", especie: "Cão", fornecedor: "Market" });
    expect(grupos.map((g) => g.produto.nome)).toEqual(["Bravecto Cão"]);
  });
});
