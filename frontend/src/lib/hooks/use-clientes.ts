import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClientes } from "@/lib/api/clientes";
import type { CreateClienteInput, UpdateClienteInput } from "@/lib/schemas/cliente.schema";

interface ListParams {
  q?: string;
  page?: number;
  limit?: number;
}

export function useClientes(params?: ListParams) {
  return useQuery({
    queryKey: ["clientes", params],
    queryFn: () => apiClientes.list(params),
  });
}

export function useCliente(id: string) {
  return useQuery({
    queryKey: ["clientes", id],
    queryFn: () => apiClientes.get(id),
    enabled: !!id,
  });
}

export function useCreateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClienteInput) => apiClientes.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });
}

export function useUpdateCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateClienteInput }) =>
      apiClientes.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });
}

export function useDeleteCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClientes.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientes"] }),
  });
}
