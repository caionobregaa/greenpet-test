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
