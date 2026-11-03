export interface ProdutoCatalogo {
  id: string;
  nome: string;
  categoria: string;
  especie: string | null;
  valorVenda: number;
  imagemUrl: string | null;
}

export interface GrupoCategoria {
  categoria: string;
  produtos: ProdutoCatalogo[];
}

export interface FiltrosCatalogo {
  busca?: string;
  categoria?: string;
  especie?: string;
}

const ORDEM_CATEGORIAS = ["Ração", "Petisco", "Medicamento", "Acessório", "Higiene"];
const LIMITE_VITRINE = 8;

/** Categorias da ordem oficial primeiro; qualquer outra vem depois, sem perder produto. */
export function agruparPorCategoria(produtos: ProdutoCatalogo[]): GrupoCategoria[] {
  const grupos = new Map<string, ProdutoCatalogo[]>();
  for (const produto of produtos) {
    grupos.set(produto.categoria, [...(grupos.get(produto.categoria) ?? []), produto]);
  }
  const posicao = (categoria: string) => {
    const i = ORDEM_CATEGORIAS.indexOf(categoria);
    return i === -1 ? ORDEM_CATEGORIAS.length : i;
  };
  return [...grupos.keys()]
    .sort((a, b) => posicao(a) - posicao(b) || a.localeCompare(b, "pt-BR"))
    .map((categoria) => ({ categoria, produtos: grupos.get(categoria)! }));
}

/** Até 8 produtos por categoria, com os que têm foto primeiro. */
export function montarVitrine(produtos: ProdutoCatalogo[]): GrupoCategoria[] {
  return agruparPorCategoria(produtos).map((grupo) => ({
    categoria: grupo.categoria,
    produtos: [
      ...grupo.produtos.filter((p) => p.imagemUrl),
      ...grupo.produtos.filter((p) => !p.imagemUrl),
    ].slice(0, LIMITE_VITRINE),
  }));
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** "Cão e Gato" e produto sem espécie cadastrada aparecem em qualquer filtro de espécie. */
function atendeEspecie(produto: ProdutoCatalogo, especie: string): boolean {
  return !produto.especie || produto.especie === especie || produto.especie === "Cão e Gato";
}

/** Cada palavra da busca precisa aparecer no nome, em qualquer ordem. */
export function filtrarProdutos(produtos: ProdutoCatalogo[], filtros: FiltrosCatalogo): ProdutoCatalogo[] {
  const termos = normalizar(filtros.busca ?? "").split(/\s+/).filter(Boolean);
  return produtos.filter((p) => {
    if (filtros.categoria && p.categoria !== filtros.categoria) return false;
    if (filtros.especie && !atendeEspecie(p, filtros.especie)) return false;
    const nome = normalizar(p.nome);
    return termos.every((termo) => nome.includes(termo));
  });
}

/** Foto servida pelo próprio site, a partir do caminho devolvido pela API. */
export function urlDaFoto(produto: Pick<ProdutoCatalogo, "id" | "imagemUrl">): string | null {
  if (!produto.imagemUrl) return null;
  const query = produto.imagemUrl.split("?")[1];
  return `/imagens/produtos/${encodeURIComponent(produto.id)}${query ? `?${query}` : ""}`;
}
