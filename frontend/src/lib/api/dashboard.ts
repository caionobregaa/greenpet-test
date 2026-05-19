import { api } from "./client";
import type { DashboardKPIs } from "@/lib/types/dashboard";

export const apiDashboard = {
  getKPIs: async (inicio: string, fim: string): Promise<DashboardKPIs> => {
    const { data } = await api.get<{ data: DashboardKPIs }>("/dashboard", {
      params: { inicio, fim },
    });
    return data.data;
  },
};
