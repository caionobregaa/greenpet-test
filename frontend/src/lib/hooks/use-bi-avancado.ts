import { useQuery } from "@tanstack/react-query";
import { apiBiAvancado } from "@/lib/api/bi-avancado";
import { todayISO } from "@/lib/utils/format";

function firstDayOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

export function useBiAvancado(inicio?: string, fim?: string, page = 1, limit = 10) {
  const start = inicio ?? firstDayOfMonth();
  const end = fim ?? todayISO();
  return useQuery({
    queryKey: ["bi-avancado", { inicio: start, fim: end, page, limit }],
    queryFn: () => apiBiAvancado.get(start, end, page, limit),
    staleTime: 30_000,
  });
}
