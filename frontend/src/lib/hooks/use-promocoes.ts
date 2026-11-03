import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPromocoes } from "@/lib/api/promocoes";
import type { SalvarPromocaoInput } from "@/lib/types/promocao";

export function usePromocoes() {
  return useQuery({ queryKey: ["promocoes"], queryFn: () => apiPromocoes.list() });
}

/** Promoção mexe no preço sugerido dos produtos: as duas listas são recarregadas. */
function useInvalidar() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["promocoes"] });
    qc.invalidateQueries({ queryKey: ["produtos"] });
  };
}

export function useSalvarPromocao() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: SalvarPromocaoInput }) =>
      id ? apiPromocoes.update(id, input) : apiPromocoes.create(input),
    onSuccess: invalidar,
  });
}

export function useEncerrarPromocao() {
  const invalidar = useInvalidar();
  return useMutation({ mutationFn: (id: string) => apiPromocoes.encerrar(id), onSuccess: invalidar });
}

export function useExcluirPromocao() {
  const invalidar = useInvalidar();
  return useMutation({ mutationFn: (id: string) => apiPromocoes.delete(id), onSuccess: invalidar });
}
