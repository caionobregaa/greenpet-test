import { api } from "./client";
import type { ApiResponse, ApiMeta } from "@/lib/types/api";
import type { EstoqueItem } from "@/lib/types/estoque";

interface ListParams {
  produtoId?: string;
  page?: number;
  limit?: number;
}

export interface CreateEstoqueItemInput {
  produtoId: string;
  quantidade: number;
  validade?: string | null;
  lote?: string;
  obs?: string;
}

export interface UpdateEstoqueItemInput {
  quantidade?: number;
  validade?: string | null;
  lote?: string;
  obs?: string;
}

export const apiEstoque = {
  list: async (params?: ListParams): Promise<{ data: EstoqueItem[]; meta: ApiMeta }> => {
    const { data } = await api.get<{ data: EstoqueItem[]; meta: ApiMeta }>("/estoque", { params });
    return data;
  },

  create: async (input: CreateEstoqueItemInput): Promise<EstoqueItem> => {
    const { data } = await api.post<ApiResponse<EstoqueItem>>("/estoque", input);
    return data.data;
  },

  update: async (id: string, input: UpdateEstoqueItemInput): Promise<EstoqueItem> => {
    const { data } = await api.put<ApiResponse<EstoqueItem>>(`/estoque/${id}`, input);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/estoque/${id}`);
  },
};
