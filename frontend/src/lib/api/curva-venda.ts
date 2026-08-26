import { api } from "./client";
import type { CurvaVendaItem, CurvaVendaMeta, CurvaVendaSortField, SortOrder } from "@/lib/types/curva-venda";

interface ListParams {
  dataInicio?: string;
  dataFim?: string;
  categoria?: string;
  sortBy?: CurvaVendaSortField;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export const apiCurvaVenda = {
  list: async (params?: ListParams): Promise<{ data: CurvaVendaItem[]; meta: CurvaVendaMeta }> => {
    const { data } = await api.get<{ data: CurvaVendaItem[]; meta: CurvaVendaMeta }>("/curva-venda", { params });
    return data;
  },
};
