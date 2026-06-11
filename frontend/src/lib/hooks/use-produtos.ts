import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiProdutos } from "@/lib/api/produtos";
import type { CreateProdutoInput, UpdateProdutoInput } from "@/lib/schemas/produto.schema";

interface ListParams {
  q?: string;
  categoria?: string;
  especie?: string;
  fornecedor?: string;
  marca?: string;
  page?: number;
  limit?: number;
}

export function useProdutos(params?: ListParams) {
  return useQuery({
    queryKey: ["produtos", params],
    queryFn: () => apiProdutos.list(params),
  });
}

export function useProduto(id: string) {
  return useQuery({
    queryKey: ["produtos", id],
    queryFn: () => apiProdutos.get(id),
    enabled: !!id,
  });
}

export function useCreateProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProdutoInput) => apiProdutos.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos"] }),
  });
}

export function useUpdateProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProdutoInput }) =>
      apiProdutos.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos"] }),
  });
}

export function useDeleteProduto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiProdutos.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["produtos"] }),
  });
}
