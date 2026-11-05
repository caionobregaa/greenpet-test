// specs/produtos/spec-v9.md
export const CATEGORIAS_RACAO = ['Ração', 'Ração Úmida']

const SIGLA_FN = /(^|[^A-Za-zÀ-ÿ0-9])FN(?=[^A-Za-zÀ-ÿ0-9]|$)/g

/** Em rações, a sigla "FN" isolada no nome vira "Fórmula Natural". */
export function normalizarNomeProduto(nome: string, categoria: string): string {
  if (!CATEGORIAS_RACAO.includes(categoria)) return nome
  return nome.replace(SIGLA_FN, '$1Fórmula Natural')
}
