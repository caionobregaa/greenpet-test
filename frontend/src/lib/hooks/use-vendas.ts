import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiVendas } from "@/lib/api/vendas";
import type { CreateVendaInput, UpdateVendaInput } from "@/lib/schemas/venda.schema";
import type { FormaPag } from "@/lib/types/venda";

export function useVendasSemCusto() {
  return useQuery({
    queryKey: ["vendas-sem-custo"],
    queryFn: () => apiVendas.semCusto(),
    staleTime: 1000 * 60 * 5,
  });
}

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
      // A venda mexe no estoque (estoque/spec-v2)
      qc.invalidateQueries({ queryKey: ["estoque"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
      qc.invalidateQueries({ queryKey: ["recompra"] });
      qc.invalidateQueries({ queryKey: ["vendas-em-aberto"] });
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
      // A venda mexe no estoque (estoque/spec-v2)
      qc.invalidateQueries({ queryKey: ["estoque"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
      qc.invalidateQueries({ queryKey: ["recompra"] });
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
      // A venda mexe no estoque (estoque/spec-v2)
      qc.invalidateQueries({ queryKey: ["estoque"] });
      qc.invalidateQueries({ queryKey: ["produtos"] });
      qc.invalidateQueries({ queryKey: ["vendas-em-aberto"] });
    },
  });
}

// Valor em aberto (specs/vendas/spec-v6.md)

export function useVendasEmAberto() {
  return useQuery({
    queryKey: ["vendas-em-aberto"],
    queryFn: () => apiVendas.emAberto(),
  });
}

function useInvalidarPagamento() {
  const qc = useQueryClient();
  return (id: string) => {
    qc.invalidateQueries({ queryKey: ["vendas"] });
    qc.invalidateQueries({ queryKey: ["vendas", id] });
    qc.invalidateQueries({ queryKey: ["vendas-em-aberto"] });
  };
}

export function useRegistrarPagamento() {
  const invalidar = useInvalidarPagamento();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { valor: number; data?: string; formaPag: FormaPag; obs?: string } }) =>
      apiVendas.registrarPagamento(id, input),
    onSuccess: (_data, vars) => invalidar(vars.id),
  });
}

export function useRemoverPagamento() {
  const invalidar = useInvalidarPagamento();
  return useMutation({
    mutationFn: ({ id, pagamentoId }: { id: string; pagamentoId: string }) => apiVendas.removerPagamento(id, pagamentoId),
    onSuccess: (_data, vars) => invalidar(vars.id),
  });
}
