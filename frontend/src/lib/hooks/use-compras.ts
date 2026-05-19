import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiCompras } from "@/lib/api/compras";
import type { CreateCompraInput, UpdateCompraInput } from "@/lib/schemas/compra.schema";
import type { CompraAcao } from "@/lib/types/compra";

interface ListParams {
  status?: string;
  fornecedor?: string;
  page?: number;
  limit?: number;
}

export function useCompras(params?: ListParams) {
  return useQuery({
    queryKey: ["compras", params],
    queryFn: () => apiCompras.list(params),
  });
}

export function useCompra(id: string) {
  return useQuery({
    queryKey: ["compras", id],
    queryFn: () => apiCompras.get(id),
    enabled: !!id,
  });
}

export function useCreateCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCompraInput) => apiCompras.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["compras"] }),
  });
}

export function useUpdateCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCompraInput }) =>
      apiCompras.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["compras"] }),
  });
}

export function useUpdateCompraStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, acao }: { id: string; acao: CompraAcao }) =>
      apiCompras.updateStatus(id, acao),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["compras"] }),
  });
}

export function useDeleteCompra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiCompras.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["compras"] }),
  });
}
