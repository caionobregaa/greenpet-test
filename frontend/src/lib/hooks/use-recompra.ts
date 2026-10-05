import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRecompra, type CreateManualParams } from "@/lib/api/recompra";
import type { Urgencia, CicloRecompra } from "@/lib/types/recompra";

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
    mutationFn: (params: { produtoId: string; clienteId: string; animalId?: string; reason: "ok" | "cancelado" }) =>
      apiRecompra.dismiss({ ...params, animalId: params.animalId ?? '' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recompra"] }),
  });
}

export function useCreateRecompraManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateManualParams) => apiRecompra.createManual(params),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recompra"] }),
  });
}

export function useDeleteRecompraManual() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiRecompra.deleteManual(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["recompra"] }),
  });
}

// Mensagem enviada e motivos mudam o que aparece em Avisos, Dashboard, Clientes e BI.
function useInvalidarRecompra() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["recompra"] });
    qc.invalidateQueries({ queryKey: ["dashboard-operacional"] });
    qc.invalidateQueries({ queryKey: ["bi-avancado"] });
  };
}

export function useMarcarMensagem() {
  const invalidar = useInvalidarRecompra();
  return useMutation({ mutationFn: (ciclo: CicloRecompra) => apiRecompra.marcarMensagem(ciclo), onSuccess: invalidar });
}

export function useDesmarcarMensagem() {
  const invalidar = useInvalidarRecompra();
  return useMutation({ mutationFn: (ciclo: CicloRecompra) => apiRecompra.desmarcarMensagem(ciclo), onSuccess: invalidar });
}

export function useClientesSumidos() {
  return useQuery({ queryKey: ["recompra", "sumidos"], queryFn: () => apiRecompra.sumidos() });
}

export function useRegistrarMotivosSumido() {
  const invalidar = useInvalidarRecompra();
  return useMutation({
    mutationFn: (params: CicloRecompra & { motivos: string[]; outroTexto: string | null }) => apiRecompra.registrarMotivos(params),
    onSuccess: invalidar,
  });
}
