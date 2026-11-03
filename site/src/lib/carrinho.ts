import type { ProdutoCatalogo } from "./catalogo";

/** Quantidade por id de produto: preços e nomes sempre vêm do catálogo atual. */
export type ItensCarrinho = Record<string, number>;

export interface LinhaCarrinho {
  produto: ProdutoCatalogo;
  quantidade: number;
  subtotal: number;
}

const STORAGE_KEY = "beezpet:carrinho";
export const QUANTIDADE_MAXIMA = 99;

export function lerCarrinho(): ItensCarrinho {
  try {
    const salvo: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (!salvo || typeof salvo !== "object" || Array.isArray(salvo)) return {};
    return Object.fromEntries(
      Object.entries(salvo).filter(
        ([, quantidade]) => Number.isInteger(quantidade) && quantidade > 0 && quantidade <= QUANTIDADE_MAXIMA,
      ),
    );
  } catch {
    return {};
  }
}

export function salvarCarrinho(itens: ItensCarrinho): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
  } catch {
    // Sem armazenamento (navegação privada, por exemplo), o carrinho vale só nesta página.
  }
}

export function alterarQuantidade(itens: ItensCarrinho, id: string, quantidade: number): ItensCarrinho {
  const resto = { ...itens };
  delete resto[id];
  if (quantidade <= 0) return resto;
  return { ...resto, [id]: Math.min(quantidade, QUANTIDADE_MAXIMA) };
}

/** Tira itens que saíram do catálogo. Sem catálogo carregado (`null`), não mexe no carrinho. */
export function conciliarCarrinho(
  itens: ItensCarrinho,
  produtos: ProdutoCatalogo[] | null,
): { itens: ItensCarrinho; removidos: number } {
  if (!produtos) return { itens, removidos: 0 };
  const ids = new Set(produtos.map((p) => p.id));
  const validos = Object.entries(itens).filter(([id]) => ids.has(id));
  return { itens: Object.fromEntries(validos), removidos: Object.keys(itens).length - validos.length };
}

export function montarLinhas(itens: ItensCarrinho, produtos: ProdutoCatalogo[]): LinhaCarrinho[] {
  return produtos
    .filter((produto) => itens[produto.id])
    .map((produto) => ({
      produto,
      quantidade: itens[produto.id],
      subtotal: Math.round(produto.valorVenda * 100) * itens[produto.id] / 100,
    }));
}

export function calcularTotal(linhas: LinhaCarrinho[]): number {
  return linhas.reduce((soma, linha) => soma + Math.round(linha.subtotal * 100), 0) / 100;
}
