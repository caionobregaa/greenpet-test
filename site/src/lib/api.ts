import { connection } from "next/server";
import type { ProdutoCatalogo } from "./catalogo";

const CACHE_SEGUNDOS = 300;

export function backendUrl(): string {
  return process.env.BACKEND_URL ?? "http://localhost:3001";
}

/**
 * Produtos publicados, com cache de 5 minutos. `null` indica falha da API, para a página mostrar
 * o aviso sem o carrinho entender que o catálogo ficou vazio.
 */
export async function buscarProdutos(): Promise<ProdutoCatalogo[] | null> {
  // Renderiza a cada acesso, para o build não depender do backend.
  await connection();
  try {
    const res = await fetch(`${backendUrl()}/api/v1/catalogo/produtos`, { next: { revalidate: CACHE_SEGUNDOS } });
    if (!res.ok) return null;
    const corpo = (await res.json()) as { data: ProdutoCatalogo[] };
    return corpo.data;
  } catch {
    return null;
  }
}
