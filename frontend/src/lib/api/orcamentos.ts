import { api } from "./client";
import type { ApiResponse, ApiMeta } from "@/lib/types/api";
import type { Orcamento } from "@/lib/types/orcamento";
import type { CreateOrcamentoInput, UpdateOrcamentoInput, ConverterOrcamentoInput } from "@/lib/schemas/orcamento.schema";
import type { Venda } from "@/lib/types/venda";

interface ListParams {
  clienteId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export const apiOrcamentos = {
  list: async (params?: ListParams): Promise<{ data: Orcamento[]; meta: ApiMeta }> => {
    const { data } = await api.get<{ data: Orcamento[]; meta: ApiMeta }>("/orcamentos", { params });
    return data;
  },

  get: async (id: string): Promise<Orcamento> => {
    const { data } = await api.get<ApiResponse<Orcamento>>(`/orcamentos/${id}`);
    return data.data;
  },

  create: async (input: CreateOrcamentoInput): Promise<Orcamento> => {
    const payload = {
      ...input,
      animalId: input.animalId || undefined,
      obs: input.obs || undefined,
      data: input.data || undefined,
      formasPag: input.formasPag ?? [],
    };
    const { data } = await api.post<ApiResponse<Orcamento>>("/orcamentos", payload);
    return data.data;
  },

  update: async (id: string, input: UpdateOrcamentoInput): Promise<Orcamento> => {
    const payload = {
      ...input,
      obs: input.obs || undefined,
      itens: input.itens?.map((item) => ({ ...item, produtoId: item.produtoId ?? undefined })),
    };
    const { data } = await api.put<ApiResponse<Orcamento>>(`/orcamentos/${id}`, payload);
    return data.data;
  },

  updateStatus: async (id: string, acao: "aprovar" | "recusar" | "reabrir"): Promise<Orcamento> => {
    const { data } = await api.patch<ApiResponse<Orcamento>>(`/orcamentos/${id}/status`, { acao });
    return data.data;
  },

  converter: async (id: string, input: ConverterOrcamentoInput): Promise<{ vendaId: string }> => {
    const { data } = await api.post<ApiResponse<{ vendaId: string }>>(`/orcamentos/${id}/converter`, input);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/orcamentos/${id}`);
  },
};
