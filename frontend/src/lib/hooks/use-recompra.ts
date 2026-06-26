import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRecompra, type CreateManualParams } from "@/lib/api/recompra";
import type { Urgencia } from "@/lib/types/recompra";

interface ListParams {
  clienteId?: string;
  urgencia?: Urgencia;
  page?: number;
  limit?: number;
}

export function useRecompra(params?: ListParams) {
  return useQuery({
    queryKey: ["recompra", params],
    queryFn: () => apiRecompra.list(params),
  });
}

export function useDismissRecompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { produtoId: string; clienteId: string; animalId?: string; reason: "ok" | "cancelado" }) =>
      apiRecompra.dismiss({ ...params, animalId: params.animalId ?? '' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recompra"] }),
  });
}

export function useCreateRecompraManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateManualParams) => apiRecompra.createManual(params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recompra"] }),
  });
}

export function useDeleteRecompraManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRecompra.deleteManual(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recompra"] }),
  });
}
