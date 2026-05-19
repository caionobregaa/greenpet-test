import { format, parseISO, differenceInYears, differenceInMonths, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) return "—";
    return format(d, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    if (!isValid(d)) return "—";
    return format(d, "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return "—";
  }
}

export function formatIdade(nascimento: string | null | undefined): string {
  if (!nascimento) return "—";
  try {
    const d = parseISO(nascimento);
    if (!isValid(d)) return "—";
    const anos = differenceInYears(new Date(), d);
    if (anos >= 1) return `${anos} ano${anos !== 1 ? "s" : ""}`;
    const meses = differenceInMonths(new Date(), d);
    return `${meses} mês${meses !== 1 ? "es" : ""}`;
  } catch {
    return "—";
  }
}

export function formatDiasRestantes(dias: number): string {
  if (dias > 0) return `em ${dias} dia${dias !== 1 ? "s" : ""}`;
  if (dias === 0) return "hoje";
  const abs = Math.abs(dias);
  return `há ${abs} dia${abs !== 1 ? "s" : ""}`;
}

export function formatPhone(phone: string | null | undefined): string {
  return phone ?? "—";
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
