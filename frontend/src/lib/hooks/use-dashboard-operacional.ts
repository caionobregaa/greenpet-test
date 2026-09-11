import { useQuery } from "@tanstack/react-query";
import { apiDashboardOperacional } from "@/lib/api/dashboard-operacional";
import { todayISO } from "@/lib/utils/format";

function firstDayOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

export function useDashboardOperacional(inicio?: string, fim?: string) {
  const start = inicio ?? firstDayOfMonth();
  const end = fim ?? todayISO();
  return useQuery({
    queryKey: ["dashboard-operacional", { inicio: start, fim: end }],
    queryFn: () => apiDashboardOperacional.get(start, end),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
