import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiVendas } from "@/lib/api/vendas";
import type { CreateVendaInput, UpdateVendaInput } from "@/lib/schemas/venda.schema";

interface ListParams {
  clienteId?: string;
  animalId?: string;
  page?: number;
  limit?: number;
}

export function useVendas(params?: ListParams) {
  return useQuery({
    queryKey: ["vendas", params],
    queryFn: () => apiVendas.list(params),
  });
}

export function useVenda(id: string) {
  return useQuery({
    queryKey: ["vendas", id],
    queryFn: () => apiVendas.get(id),
    enabled: !!id,
  });
}

export function useCreateVenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateVendaInput) => apiVendas.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendas"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["recompra"] });
    },
  });
}

export function useUpdateVenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVendaInput }) => apiVendas.update(id, input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["vendas"] });
      qc.invalidateQueries({ queryKey: ["vendas", vars.id] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteVenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiVendas.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vendas"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
