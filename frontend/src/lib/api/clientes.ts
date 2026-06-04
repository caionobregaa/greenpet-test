import { api } from "./client";

function formatCPF(v: string): string {
  const d = v.replace(/\D/g, "");
  if (d.length !== 11) return v;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}
import type { ApiResponse, ApiMeta } from "@/lib/types/api";
import type { Cliente, ClienteDetail } from "@/lib/types/cliente";
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

  get: async (id: string): Promise<ClienteDetail> => {
    const { data } = await api.get<ApiResponse<ClienteDetail>>(`/clientes/${id}`);
    return data.data;
  },

  create: async (input: CreateClienteInput): Promise<Cliente> => {
    const payload = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== "" && v !== undefined)
    );
    if (payload.cpf) payload.cpf = formatCPF(payload.cpf as string);
    const { data } = await api.post<ApiResponse<Cliente>>("/clientes", payload);
    return data.data;
  },

  update: async (id: string, input: UpdateClienteInput): Promise<Cliente> => {
    const payload = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== "" && v !== undefined)
    );
    if (payload.cpf) payload.cpf = formatCPF(payload.cpf as string);
    const { data } = await api.put<ApiResponse<Cliente>>(`/clientes/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/clientes/${id}`);
  },
};
