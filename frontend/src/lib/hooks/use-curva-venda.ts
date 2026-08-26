import { useQuery } from "@tanstack/react-query";
import { apiCurvaVenda } from "@/lib/api/curva-venda";

interface ListParams {
  dataInicio?: string;
  dataFim?: string;
  categoria?: string;
  page?: number;
  limit?: number;
}

export function useCurvaVenda(params?: ListParams) {
  return useQuery({
    queryKey: ["curva-venda", params],
    queryFn: () => apiCurvaVenda.list(params),
  });
}
