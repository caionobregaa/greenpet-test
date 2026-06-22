import { api } from "./client";
import type { ApiResponse } from "@/lib/types/api";
import type { Lembrete } from "@/lib/types/lembrete";

export const apiLembretes = {
  list: async (): Promise<Lembrete[]> => {
    const { data } = await api.get<{ data: Lembrete[] }>("/lembretes");
    return data.data;
  },

  create: async (texto: string): Promise<Lembrete> => {
    const { data } = await api.post<ApiResponse<Lembrete>>("/lembretes", { texto });
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/lembretes/${id}`);
  },
};
