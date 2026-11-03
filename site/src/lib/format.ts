/** Valor em reais com espaço comum: o espaço especial do Intl atrapalha na mensagem do WhatsApp. */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
    .format(value)
    .replace(/ /g, " ");
}
