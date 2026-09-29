// Meses no formato `YYYY-MM` (mesmo formato do backend).

/** Mês de `data` (padrão: hoje) na hora local. */
export function mesAtual(data: Date = new Date()): string {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

/** Soma `delta` meses (negativo volta), virando o ano quando precisa. */
export function deslocarMes(mes: string, delta: number): string {
  const [ano, m] = mes.split("-").map(Number);
  return mesAtual(new Date(ano, m - 1 + delta, 1));
}

function dataDoMes(mes: string): Date {
  const [ano, m] = mes.split("-").map(Number);
  return new Date(ano, m - 1, 1);
}

/** "Setembro de 2026" */
export function rotuloMes(mes: string): string {
  const texto = dataDoMes(mes).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/** "set/26" */
export function rotuloMesCurto(mes: string): string {
  const nome = dataDoMes(mes).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return `${nome}/${mes.slice(2, 4)}`;
}
