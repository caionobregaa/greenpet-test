export const CATEGORIAS_PRODUTO = ["Ração", "Ração Úmida", "Petisco", "Suplemento", "Medicamento", "Acessório", "Higiene", "Serviço"];

/** Ração Úmida se comporta como Ração: composição do nome e duração por peso (specs/produtos/spec-v9.md). */
export function ehRacao(categoria: string | undefined | null): boolean {
  return categoria === "Ração" || categoria === "Ração Úmida";
}
export const ESPECIES_PRODUTO = ["Cão", "Gato", "Cão e Gato"];

function normalizarBusca(texto: string): string {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/**
 * Mesma regra da busca do backend (specs/produtos/spec-v4.md), para filtros locais:
 * toda palavra de `busca` precisa aparecer, em qualquer ordem e posição, em nome, marca,
 * SKU (hífen opcional) ou código de barras — sem diferenciar acento nem maiúscula.
 */
export function produtoCorrespondeBusca(
  produto: { nome: string; marca?: string | null; sku?: string | null; codigoBarras?: string | null },
  busca: string,
): boolean {
  const termos = normalizarBusca(busca).split(/\s+/).filter(Boolean);
  if (termos.length === 0) return true;
  const textos = normalizarBusca([produto.nome, produto.marca ?? "", produto.codigoBarras ?? ""].join(" "));
  const sku = normalizarBusca(produto.sku ?? "").replace(/-/g, "");
  return termos.every((t) => textos.includes(t) || sku.includes(t.replace(/-/g, "")));
}

const ESPECIES_E_FASES = ["Cão e Gato", "Cão", "Gato", "Filhote", "Adulto", "Sênior"];

/**
 * Parte fixa do nome de uma ração composta (specs/produtos/spec-v10.md): tira o peso do fim, corta em
 * " PORTE " ou " SABOR " e remove espécie e fase que sobrarem no fim.
 */
export function extrairNomeBaseRacao(nome: string): string {
  let base = nome.trim().replace(/\s*\d+(?:[.,]\d+)?\s*(?:kg|g|mL|L|Comprimidos|unidade)\s*$/i, "");
  const corte = [" PORTE ", " SABOR "].map((m) => base.indexOf(m)).filter((i) => i > 0);
  if (corte.length) base = base.slice(0, Math.min(...corte));
  let mudou = true;
  while (mudou) {
    mudou = false;
    for (const termo of ESPECIES_E_FASES) {
      if (base.endsWith(` ${termo}`)) {
        base = base.slice(0, -termo.length - 1);
        mudou = true;
      }
    }
  }
  return base.trim();
}

export function composeNomeRacao(parts: {
  nomeRacao: string;
  especie?: string;
  faseDaVida?: string;
  porte?: string;
  sabor?: string;
  pesoEmbalagem?: number;
  unidadeEmbalagem?: string;
}): string {
  const segments = [parts.nomeRacao.trim()];
  if (parts.especie?.trim()) segments.push(parts.especie.trim());
  if (parts.faseDaVida?.trim()) segments.push(parts.faseDaVida.trim());
  if (parts.porte?.trim()) segments.push(`PORTE ${parts.porte.trim()}`);
  if (parts.sabor?.trim()) segments.push(`SABOR ${parts.sabor.trim()}`);
  if (parts.pesoEmbalagem != null && parts.pesoEmbalagem > 0 && parts.unidadeEmbalagem?.trim()) {
    segments.push(`${parts.pesoEmbalagem}${parts.unidadeEmbalagem.trim()}`);
  }
  return segments.join(" ");
}
