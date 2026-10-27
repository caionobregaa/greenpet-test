import { toast } from "sonner";
import type { AvisoEstoque } from "@/lib/types/estoque";

/** "Ração X: vendido 3, só havia 1 em estoque" (specs/estoque/spec-v2.md). */
export function descreverAvisosEstoque(avisos: AvisoEstoque[]): string {
  return avisos
    .map((a) => `${a.nome}: vendido ${a.qtd}, ${a.qtdBaixada === 0 ? "sem estoque" : `só havia ${a.qtdBaixada} em estoque`}`)
    .join(" · ");
}

/** Depois de salvar: avisa os itens vendidos com estoque insuficiente. */
export function avisarEstoqueInsuficiente(avisos?: AvisoEstoque[]): void {
  if (!avisos || avisos.length === 0) return;
  toast.warning("Venda registrada com estoque insuficiente", {
    description: `${descreverAvisosEstoque(avisos)}. Lance a compra/estoque desses produtos.`,
    duration: 12000,
  });
}
