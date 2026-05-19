import { api } from "./client";
import type { ApiResponse, ApiMeta } from "@/lib/types/api";
import type { Produto } from "@/lib/types/produto";
import type { CreateProdutoInput, UpdateProdutoInput } from "@/lib/schemas/produto.schema";

interface ListParams {
  q?: string;
  categoria?: string;
  especie?: string;
  page?: number;
  limit?: number;
}

export const apiProdutos = {
  list: async (params?: ListParams): Promise<{ data: Produto[]; meta: ApiMeta }> => {
    const { data } = await api.get<{ data: Produto[]; meta: ApiMeta }>("/produtos", { params });
    return data;
  },

  get: async (id: string): Promise<Produto> => {
    const { data } = await api.get<ApiResponse<Produto>>(`/produtos/${id}`);
    return data.data;
  },

  create: async (input: CreateProdutoInput): Promise<Produto> => {
    const payload = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== "" && v !== undefined)
    );
    const { data } = await api.post<ApiResponse<Produto>>("/produtos", payload);
    return data.data;
  },

  update: async (id: string, input: UpdateProdutoInput): Promise<Produto> => {
    const payload = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== "" && v !== undefined)
    );
    const { data } = await api.put<ApiResponse<Produto>>(`/produtos/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/produtos/${id}`);
  },
};
