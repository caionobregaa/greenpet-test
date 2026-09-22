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
