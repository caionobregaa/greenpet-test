import { api } from "./client";
import type { ApiMeta } from "@/lib/types/api";
import type { RecompraAlerta, Urgencia, CicloRecompra, ClienteSumidoAlerta } from "@/lib/types/recompra";

interface ListParams {
  clienteId?: string;
  urgencia?: Urgencia;
  page?: number;
  limit?: number;
}

export interface CreateManualParams {
  clienteId: string;
  animalId?: string;
  produtoId: string;
  ultimaCompra?: string | null;
  previsaoData?: string | null;
  diasRecompra?: number | null;
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

  createManual: async (params: CreateManualParams): Promise<{ id: string }> => {
    const { data } = await api.post<{ data: { id: string } }>("/recompra/manual", params);
    return data.data;
  },

  deleteManual: async (id: string): Promise<void> => {
    await api.delete(`/recompra/manual/${id}`);
  },

  marcarMensagem: async (ciclo: CicloRecompra): Promise<void> => {
    await api.post("/recompra/contato", ciclo);
  },

  desmarcarMensagem: async (ciclo: CicloRecompra): Promise<void> => {
    await api.delete("/recompra/contato", { data: ciclo });
  },

  sumidos: async (): Promise<ClienteSumidoAlerta[]> => {
    const { data } = await api.get<{ data: ClienteSumidoAlerta[] }>("/recompra/sumidos");
    return data.data;
  },

  registrarMotivos: async (params: CicloRecompra & { motivos: string[]; outroTexto: string | null }): Promise<void> => {
    await api.put("/recompra/sumidos/motivos", params);
  },
};
