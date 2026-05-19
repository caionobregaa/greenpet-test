import { api } from "./client";
import type { ApiResponse, ApiMeta } from "@/lib/types/api";
import type { Compra, CompraAcao } from "@/lib/types/compra";
import type { CreateCompraInput, UpdateCompraInput } from "@/lib/schemas/compra.schema";

interface ListParams {
  status?: string;
  fornecedor?: string;
  page?: number;
  limit?: number;
}

export const apiCompras = {
  list: async (params?: ListParams): Promise<{ data: Compra[]; meta: ApiMeta }> => {
    const { data } = await api.get<{ data: Compra[]; meta: ApiMeta }>("/compras", { params });
    return data;
  },

  get: async (id: string): Promise<Compra> => {
    const { data } = await api.get<ApiResponse<Compra>>(`/compras/${id}`);
    return data.data;
  },

  create: async (input: CreateCompraInput): Promise<Compra> => {
    const payload = {
      ...input,
      dataPedido: input.dataPedido || undefined,
      obs: input.obs || undefined,
    };
    const { data } = await api.post<ApiResponse<Compra>>("/compras", payload);
    return data.data;
  },

  update: async (id: string, input: UpdateCompraInput): Promise<Compra> => {
    const payload = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== "" && v !== undefined)
    );
    const { data } = await api.put<ApiResponse<Compra>>(`/compras/${id}`, payload);
    return data.data;
  },

  updateStatus: async (id: string, acao: CompraAcao): Promise<Compra> => {
    const { data } = await api.patch<ApiResponse<Compra>>(`/compras/${id}/status`, { acao });
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/compras/${id}`);
  },
};
