export interface ProdutoCatalogo {
  id: string;
  nome: string;
  categoria: string;
  especie: string | null;
  marca?: string | null;
  /** Principal primeiro, depois as adicionais (specs/catalogo/spec-v2.md). */
  categorias?: string[];
  /** Preço a pagar: o promocional durante uma campanha ativa. */
  valorVenda: number;
  /** Preço normal, para riscar; ausente ou null fora de promoção (specs/promocoes/spec-v1.md). */
  valorOriginal?: number | null;
  promocaoFim?: string | null;
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
  /** Só produtos em promoção ativa. */
  promocao?: boolean;
}

const ORDEM_CATEGORIAS = ["Ração", "Ração Úmida", "Petisco", "Medicamento", "Acessório", "Higiene"];
const LIMITE_VITRINE = 7;

export function categoriasDe(produto: Pick<ProdutoCatalogo, "categoria" | "categorias">): string[] {
  return produto.categorias?.length ? produto.categorias : [produto.categoria];
}

/** Categorias da ordem oficial primeiro; qualquer outra vem depois. O produto entra em cada uma das suas categorias. */
export function agruparPorCategoria(produtos: ProdutoCatalogo[]): GrupoCategoria[] {
  const grupos = new Map<string, ProdutoCatalogo[]>();
  for (const produto of produtos) {
    for (const categoria of categoriasDe(produto)) {
      grupos.set(categoria, [...(grupos.get(categoria) ?? []), produto]);
    }
  }
  const posicao = (categoria: string) => {
    const i = ORDEM_CATEGORIAS.indexOf(categoria);
    return i === -1 ? ORDEM_CATEGORIAS.length : i;
  };
  return [...grupos.keys()]
    .sort((a, b) => posicao(a) - posicao(b) || a.localeCompare(b, "pt-BR"))
    .map((categoria) => ({ categoria, produtos: grupos.get(categoria)! }));
}

function chaveMarca(produto: ProdutoCatalogo): string | null {
  return produto.marca?.trim().toLowerCase() || null;
}

/**
 * Até 7 produtos sorteados (specs/site/spec-v5.md): alterna entre a metade mais barata e a mais
 * cara da categoria e evita repetir marca enquanto houver outra. Com foto primeiro, se houver o bastante.
 */
export function sortearDaCategoria(
  produtos: ProdutoCatalogo[],
  aleatorio: () => number = Math.random,
  limite: number = LIMITE_VITRINE,
): ProdutoCatalogo[] {
  const comFoto = produtos.filter((p) => p.imagemUrl);
  const base = [...(comFoto.length >= limite ? comFoto : produtos)].sort((a, b) => a.valorVenda - b.valorVenda);
  const meio = Math.ceil(base.length / 2);
  const metades = [base.slice(0, meio), base.slice(meio)];
  const marcas = new Set<string>();
  const escolhidos: ProdutoCatalogo[] = [];
  let lado = aleatorio() < 0.5 ? 0 : 1;

  while (escolhidos.length < limite && (metades[0].length || metades[1].length)) {
    if (!metades[lado].length) lado = 1 - lado;
    const pool = metades[lado];
    const semMarcaRepetida = pool.filter((p) => {
      const marca = chaveMarca(p);
      return !marca || !marcas.has(marca);
    });
    const candidatos = semMarcaRepetida.length ? semMarcaRepetida : pool;
    const escolhido = candidatos[Math.floor(aleatorio() * candidatos.length)];
    pool.splice(pool.indexOf(escolhido), 1);
    const marca = chaveMarca(escolhido);
    if (marca) marcas.add(marca);
    escolhidos.push(escolhido);
    lado = 1 - lado;
  }
  return escolhidos;
}

export function montarVitrine(produtos: ProdutoCatalogo[], aleatorio: () => number = Math.random): GrupoCategoria[] {
  return agruparPorCategoria(produtos).map((grupo) => ({
    categoria: grupo.categoria,
    produtos: sortearDaCategoria(grupo.produtos, aleatorio),
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
    if (filtros.promocao && !emPromocao(p)) return false;
    if (filtros.categoria && !categoriasDe(p).includes(filtros.categoria)) return false;
    if (filtros.especie && !atendeEspecie(p, filtros.especie)) return false;
    const nome = normalizar(p.nome);
    return termos.every((termo) => nome.includes(termo));
  });
}

export function emPromocao(p: Pick<ProdutoCatalogo, "valorOriginal" | "valorVenda">): boolean {
  return !!p.valorOriginal && p.valorOriginal > p.valorVenda;
}

export function descontoPercentual(p: Pick<ProdutoCatalogo, "valorOriginal" | "valorVenda">): number {
  return emPromocao(p) ? Math.round((1 - p.valorVenda / p.valorOriginal!) * 100) : 0;
}

/** Foto servida pelo próprio site, a partir do caminho devolvido pela API. */
export function urlDaFoto(produto: Pick<ProdutoCatalogo, "id" | "imagemUrl">): string | null {
  if (!produto.imagemUrl) return null;
  const query = produto.imagemUrl.split("?")[1];
  return `/imagens/produtos/${encodeURIComponent(produto.id)}${query ? `?${query}` : ""}`;
}
