import { useQuery } from "@tanstack/react-query";
import { apiDashboard } from "@/lib/api/dashboard";
import { todayISO } from "@/lib/utils/format";

function firstDayOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
}

export function useDashboard(inicio?: string, fim?: string) {
  const start = inicio ?? firstDayOfMonth();
  const end = fim ?? todayISO();
  return useQuery({
    queryKey: ["dashboard", { inicio: start, fim: end }],
    queryFn: () => apiDashboard.getKPIs(start, end),
  });
}
