import { api } from "./client";
import type { ApiResponse, ApiMeta } from "@/lib/types/api";
import type { Cliente } from "@/lib/types/cliente";
import type { CreateClienteInput, UpdateClienteInput } from "@/lib/schemas/cliente.schema";

interface ListParams {
  q?: string;
  page?: number;
  limit?: number;
}

export const apiClientes = {
  list: async (params?: ListParams): Promise<{ data: Cliente[]; meta: ApiMeta }> => {
    const { data } = await api.get<{ data: Cliente[]; meta: ApiMeta }>("/clientes", { params });
    return data;
  },

  get: async (id: string): Promise<Cliente> => {
    const { data } = await api.get<ApiResponse<Cliente>>(`/clientes/${id}`);
    return data.data;
  },

  create: async (input: CreateClienteInput): Promise<Cliente> => {
    const payload = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== "" && v !== undefined)
    );
    const { data } = await api.post<ApiResponse<Cliente>>("/clientes", payload);
    return data.data;
  },

  update: async (id: string, input: UpdateClienteInput): Promise<Cliente> => {
    const payload = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== "" && v !== undefined)
    );
    const { data } = await api.put<ApiResponse<Cliente>>(`/clientes/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clientes/${id}`);
  },
};
