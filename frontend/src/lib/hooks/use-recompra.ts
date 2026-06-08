import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRecompra } from "@/lib/api/recompra";
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
    mutationFn: (params: { produtoId: string; clienteId: string; animalId: string; reason: "ok" | "cancelado" }) =>
      apiRecompra.dismiss(params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recompra"] }),
  });
}
