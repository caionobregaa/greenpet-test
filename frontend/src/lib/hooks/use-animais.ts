import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiAnimais } from "@/lib/api/animais";
import type { CreateAnimalInput, UpdateAnimalInput } from "@/lib/schemas/animal.schema";

interface ListParams {
  clienteId?: string;
  especie?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export function useAnimais(params?: ListParams) {
  return useQuery({
    queryKey: ["animais", params],
    queryFn: () => apiAnimais.list(params),
  });
}

export function useAnimal(id: string) {
  return useQuery({
    queryKey: ["animais", id],
    queryFn: () => apiAnimais.get(id),
    enabled: !!id,
  });
}

export function useCreateAnimal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateAnimalInput) => apiAnimais.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["animais"] });
      qc.invalidateQueries({ queryKey: ["clientes"] });
    },
  });
}

export function useUpdateAnimal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAnimalInput }) =>
      apiAnimais.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["animais"] }),
  });
}

export function useDeleteAnimal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiAnimais.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["animais"] }),
  });
}
