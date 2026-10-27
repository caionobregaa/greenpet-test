import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiEstoque, type CreateEstoqueItemInput, type UpdateEstoqueItemInput } from "@/lib/api/estoque";

interface ListParams {
  produtoId?: string;
  page?: number;
  limit?: number;
}

export function useDiagnosticoEstoque() {
  return useQuery({
    queryKey: ["estoque", "diagnostico"],
    queryFn: () => apiEstoque.diagnostico(),
  });
}

export function useCorrecaoRetroativa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (aplicar: boolean) => apiEstoque.correcaoRetroativa(aplicar),
    onSuccess: (r) => {
      if (!r.aplicado) return;
      qc.invalidateQueries({ queryKey: ["estoque"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
    },
  });
}

export function useEstoque(params?: ListParams) {
  return useQuery({
    queryKey: ["estoque", params],
    queryFn: () => apiEstoque.list(params),
  });
}

export function useCreateEstoqueItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEstoqueItemInput) => apiEstoque.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["estoque"] }),
  });
}

export function useUpdateEstoqueItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEstoqueItemInput }) =>
      apiEstoque.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["estoque"] }),
  });
}

export function useDeleteEstoqueItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiEstoque.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["estoque"] }),
  });
}
