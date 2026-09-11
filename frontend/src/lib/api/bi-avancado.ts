import { api } from "./client";
import type { BiAvancado } from "@/lib/types/bi-avancado";

export const apiBiAvancado = {
  get: async (inicio: string, fim: string, page = 1, limit = 10): Promise<BiAvancado> => {
    const { data } = await api.get<{ data: BiAvancado }>("/bi/avancado", {
      params: { inicio, fim, page, limit },
    });
    return data.data;
  },
};
