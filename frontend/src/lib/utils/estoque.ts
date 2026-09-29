import type { EstoqueItem } from "@/lib/types/estoque";
import { produtoCorrespondeBusca } from "@/lib/utils/produtos";

export interface FiltrosEstoque {
  busca: string;
  categoria: string;
  especie: string;
  fornecedor: string;
}

export interface GrupoEstoque {
  produto: EstoqueItem["produto"];
  lotes: EstoqueItem[];
}

/**
 * Filtra os lotes (specs/estoque/spec-v1.md) — busca igual à de produtos + filtros exatos
 * de categoria, espécie e distribuidora — e agrupa por produto em ordem alfabética
 * (pt-BR, sem diferenciar acento/maiúscula). Lotes mantêm a ordem recebida da API.
 */
export function agruparEstoque(itens: EstoqueItem[], filtros: FiltrosEstoque): GrupoEstoque[] {
  const grupos = new Map<string, GrupoEstoque>();
  for (const item of itens) {
    const p = item.produto;
    if (filtros.categoria && p.categoria !== filtros.categoria) continue;
    if (filtros.especie && p.especie !== filtros.especie) continue;
    if (filtros.fornecedor && p.fornecedor !== filtros.fornecedor) continue;
    if (filtros.busca && !produtoCorrespondeBusca(p, filtros.busca)) continue;

    const grupo = grupos.get(item.produtoId);
    if (grupo) grupo.lotes.push(item);
    else grupos.set(item.produtoId, { produto: p, lotes: [item] });
  }
  return Array.from(grupos.values()).sort((a, b) =>
    a.produto.nome.localeCompare(b.produto.nome, "pt-BR", { sensitivity: "base" }),
  );
}
