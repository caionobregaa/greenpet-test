import { api } from "./client";
import type { ApiResponse, ApiMeta } from "@/lib/types/api";
import type { Animal } from "@/lib/types/animal";
import type { CreateAnimalInput, UpdateAnimalInput } from "@/lib/schemas/animal.schema";

interface ListParams {
  clienteId?: string;
  especie?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export const apiAnimais = {
  list: async (params?: ListParams): Promise<{ data: Animal[]; meta: ApiMeta }> => {
    const { data } = await api.get<{ data: Animal[]; meta: ApiMeta }>("/animais", { params });
    return data;
  },

  get: async (id: string): Promise<Animal> => {
    const { data } = await api.get<ApiResponse<Animal>>(`/animais/${id}`);
    return data.data;
  },

  create: async (input: CreateAnimalInput): Promise<Animal> => {
    const payload = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== "" && v !== undefined)
    );
    const { data } = await api.post<ApiResponse<Animal>>("/animais", payload);
    return data.data;
  },

  update: async (id: string, input: UpdateAnimalInput): Promise<Animal> => {
    const payload = Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== "" && v !== undefined)
    );
    const { data } = await api.put<ApiResponse<Animal>>(`/animais/${id}`, payload);
    return data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/animais/${id}`);
  },
};
