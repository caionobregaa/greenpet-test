// Meses no formato `YYYY-MM`. Datas de negócio (ex. `Compra.dataPedido`) são gravadas
// como meia-noite UTC a partir de `YYYY-MM-DD`, então os limites de mês são em UTC.

export const MES_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/

/** Intervalo semiaberto `[inicio, fim)` do mês: dia 1 às 00:00 UTC até o dia 1 do mês seguinte. */
export function intervaloDoMes(mes: string): { inicio: Date; fim: Date } {
  const [ano, m] = mes.split('-').map(Number)
  return { inicio: new Date(Date.UTC(ano, m - 1, 1)), fim: new Date(Date.UTC(ano, m, 1)) }
}

/** Os `n` meses que terminam no mês de `referencia`, do mais antigo ao mais recente. */
export function ultimosMeses(n: number, referencia: Date): string[] {
  const ano = referencia.getFullYear()
  const mes = referencia.getMonth()
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(ano, mes - (n - 1 - i), 1))
    return d.toISOString().slice(0, 7)
  })
}
