import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiOrcamentos } from "@/lib/api/orcamentos";
import type { CreateOrcamentoInput, UpdateOrcamentoInput, ConverterOrcamentoInput } from "@/lib/schemas/orcamento.schema";

interface ListParams {
  clienteId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useOrcamentos(params?: ListParams) {
  return useQuery({
    queryKey: ["orcamentos", params],
    queryFn: () => apiOrcamentos.list(params),
  });
}

export function useOrcamento(id: string) {
  return useQuery({
    queryKey: ["orcamentos", id],
    queryFn: () => apiOrcamentos.get(id),
    enabled: !!id,
  });
}

export function useCreateOrcamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateOrcamentoInput) => apiOrcamentos.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orcamentos"] }),
  });
}

export function useUpdateOrcamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOrcamentoInput }) =>
      apiOrcamentos.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orcamentos"] }),
  });
}

export function useUpdateOrcamentoStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, acao }: { id: string; acao: "aprovar" | "recusar" | "reabrir" }) =>
      apiOrcamentos.updateStatus(id, acao),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orcamentos"] }),
  });
}

export function useConverterOrcamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ConverterOrcamentoInput }) =>
      apiOrcamentos.converter(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orcamentos"] });
      qc.invalidateQueries({ queryKey: ["vendas"] });
      qc.invalidateQueries({ queryKey: ["estoque"] });
    },
  });
}

export function useDeleteOrcamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiOrcamentos.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orcamentos"] }),
  });
}
