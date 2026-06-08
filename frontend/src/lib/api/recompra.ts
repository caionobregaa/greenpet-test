import { api } from "./client";
import type { ApiMeta } from "@/lib/types/api";
import type { RecompraAlerta, Urgencia } from "@/lib/types/recompra";

interface ListParams {
  clienteId?: string;
  urgencia?: Urgencia;
  page?: number;
  limit?: number;
}

export const apiRecompra = {
  list: async (params?: ListParams): Promise<{ data: RecompraAlerta[]; meta: ApiMeta }> => {
    const { data } = await api.get<{ data: RecompraAlerta[]; meta: ApiMeta }>("/recompra", { params });
    return data;
  },

  dismiss: async (params: {
    produtoId: string;
    clienteId: string;
    animalId: string;
    reason: "ok" | "cancelado";
  }): Promise<void> => {
    await api.post("/recompra/dismiss", params);
  },
};
