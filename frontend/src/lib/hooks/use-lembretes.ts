import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiLembretes } from "@/lib/api/lembretes";

export function useLembretes() {
  return useQuery({
    queryKey: ["lembretes"],
    queryFn: () => apiLembretes.list(),
  });
}

export function useCreateLembrete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (texto: string) => apiLembretes.create(texto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lembretes"] }),
  });
}

export function useDeleteLembrete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiLembretes.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lembretes"] }),
  });
}
