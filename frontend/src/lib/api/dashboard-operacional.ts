import { api } from "./client";
import type { DashboardOperacional } from "@/lib/types/dashboard-operacional";

export const apiDashboardOperacional = {
  get: async (inicio: string, fim: string): Promise<DashboardOperacional> => {
    const { data } = await api.get<{ data: DashboardOperacional }>("/dashboard-operacional", {
      params: { inicio, fim },
    });
    return data.data;
  },
};
