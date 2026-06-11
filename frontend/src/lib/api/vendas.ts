import { api } from "./client";
import type { ApiResponse, ApiMeta } from "@/lib/types/api";
import type { Venda } from "@/lib/types/venda";
import type { CreateVendaInput, UpdateVendaInput } from "@/lib/schemas/venda.schema";

interface ListParams {
  clienteId?: string;
  animalId?: string;
  page?: number;
  limit?: number;
}

export const apiVendas = {
  list: async (params?: ListParams): Promise<{ data: Venda[]; meta: ApiMeta }> => {
    const { data } = await api.get<{ data: Venda[]; meta: ApiMeta }>("/vendas", { params });
    return data;
  },

  get: async (id: string): Promise<Venda> => {
    const { data } = await api.get<ApiResponse<Venda>>(`/vendas/${id}`);
    return data.data;
  },

  create: async (input: CreateVendaInput): Promise<Venda> => {
    const payload = {
      ...input,
      animalId: input.animalId || undefined,
      obs: input.obs || undefined,
      data: input.data || undefined,
    };
    const { data } = await api.post<ApiResponse<Venda>>("/vendas", payload);
    return data.data;
  },

  update: async (id: string, input: UpdateVendaInput): Promise<Venda> => {
    const { data } = await api.patch<ApiResponse<Venda>>(`/vendas/${id}`, input);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/vendas/${id}`);
  },
};
