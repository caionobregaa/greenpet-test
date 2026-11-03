import { api } from "./client";
import type { ApiResponse } from "@/lib/types/api";
import type { Promocao, SalvarPromocaoInput } from "@/lib/types/promocao";

export const apiPromocoes = {
  list: async (): Promise<Promocao[]> => {
    const { data } = await api.get<ApiResponse<Promocao[]>>("/promocoes");
    return data.data;
  },

  create: async (input: SalvarPromocaoInput): Promise<Promocao> => {
    const { data } = await api.post<ApiResponse<Promocao>>("/promocoes", input);
    return data.data;
  },

  update: async (id: string, input: SalvarPromocaoInput): Promise<Promocao> => {
    const { data } = await api.put<ApiResponse<Promocao>>(`/promocoes/${id}`, input);
    return data.data;
  },

  encerrar: async (id: string): Promise<Promocao> => {
    const { data } = await api.post<ApiResponse<Promocao>>(`/promocoes/${id}/encerrar`);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/promocoes/${id}`);
  },
};
