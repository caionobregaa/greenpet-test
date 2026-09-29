// Busca de produtos (specs/produtos/spec-v4.md): `q` vira uma lista de palavras, e cada
// uma precisa aparecer em algum campo pesquisável, em qualquer ordem e posição.
const MAX_TERMOS = 10

/**
 * Divide `q` em palavras já prontas para um LIKE '%termo%': `\`, `%` e `_` digitados
 * pelo usuário são escapados (o escape padrão do LIKE no Postgres é a barra invertida),
 * para valerem como texto e não como curinga. `q` vazio ou só espaços → lista vazia.
 */
export function parseTermosBusca(q: string | undefined): string[] {
  if (!q) return []
  return q
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, MAX_TERMOS)
    .map((termo) => termo.replace(/[\\%_]/g, '\\$&'))
}
