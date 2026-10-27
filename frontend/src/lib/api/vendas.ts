import { api } from "./client";
import type { ApiResponse, ApiMeta } from "@/lib/types/api";
import type { Venda, VendaEmAberto, FormaPag } from "@/lib/types/venda";
import type { CreateVendaInput, UpdateVendaInput } from "@/lib/schemas/venda.schema";

export interface VendaSemCusto {
  vendaId: string;
  vendaNumero: number;
  vendaData: string;
  produtos: Array<{ produtoId: string; produtoNome: string }>;
}

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

  emAberto: async (): Promise<{ data: VendaEmAberto[]; meta: { totalEmAberto: number } }> => {
    const { data } = await api.get<{ data: VendaEmAberto[]; meta: { totalEmAberto: number } }>("/vendas/em-aberto");
    return data;
  },

  registrarPagamento: async (
    id: string,
    input: { valor: number; data?: string; formaPag: FormaPag; obs?: string },
  ): Promise<Venda> => {
    const { data } = await api.post<ApiResponse<Venda>>(`/vendas/${id}/pagamentos`, input);
    return data.data;
  },

  removerPagamento: async (id: string, pagamentoId: string): Promise<Venda> => {
    const { data } = await api.delete<ApiResponse<Venda>>(`/vendas/${id}/pagamentos/${pagamentoId}`);
    return data.data;
  },

  semCusto: async (): Promise<VendaSemCusto[]> => {
    const { data } = await api.get<{ data: VendaSemCusto[] }>("/vendas/sem-custo");
    return data.data;
  },
};
