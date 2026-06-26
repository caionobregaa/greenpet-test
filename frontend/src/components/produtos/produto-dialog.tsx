"use client";

import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProdutoForm } from "./produto-form";
import { useCreateProduto, useUpdateProduto, useProduto } from "@/lib/hooks/use-produtos";
import { apiEstoque } from "@/lib/api/estoque";
import type { Produto } from "@/lib/types/produto";
import type { CreateProdutoInput } from "@/lib/schemas/produto.schema";

interface ProdutoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto?: Produto;
}

export function ProdutoDialog({ open, onOpenChange, produto }: ProdutoDialogProps) {
  const create = useCreateProduto();
  const update = useUpdateProduto();
  const isLoading = create.isPending || update.isPending;

  // Always fetch fresh data when editing so stale list cache doesn't cause price reversion
  const { data: freshProduto, isLoading: isFetchingFresh } = useProduto(produto?.id ?? "");
  const formProduto: Produto | undefined = produto
    ? (freshProduto ?? produto) // freshProduto takes precedence once loaded
    : undefined;

  async function onSubmit(data: CreateProdutoInput & { imagemUrl?: string | null; estoqueInicial?: number; estoqueValidade?: string | null; estoqueLote?: string }) {
    try {
      const { estoqueInicial, estoqueValidade, estoqueLote, ...rest } = data;
      const payload = Object.fromEntries(
        Object.entries(rest).filter(([k, v]) => k === "imagemUrl" ? v !== undefined : v !== "" && v !== undefined)
      ) as CreateProdutoInput;

      if (produto) {
        await update.mutateAsync({ id: produto.id, input: payload });
        toast.success("Produto atualizado com sucesso!");
      } else {
        const novo = await create.mutateAsync(payload);
        if (estoqueInicial && estoqueInicial > 0) {
          try {
            await apiEstoque.create({
              produtoId: novo.id,
              quantidade: estoqueInicial,
              validade: estoqueValidade ?? null,
              lote: estoqueLote || undefined,
            });
            toast.success(`Produto cadastrado! ${estoqueInicial} unidade${estoqueInicial !== 1 ? "s" : ""} lançada${estoqueInicial !== 1 ? "s" : ""} no estoque.`);
          } catch {
            toast.success("Produto cadastrado com sucesso!");
            toast.warning("Não foi possível lançar o estoque inicial. Adicione manualmente na aba Estoque.");
          }
        } else {
          toast.success("Produto cadastrado com sucesso!");
        }
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message;
      toast.error("Erro ao salvar produto", { description: msg ?? "Tente novamente." });
    }
  }

  const showLoading = produto && isFetchingFresh && !freshProduto;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[940px] sm:p-8 max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{produto ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>
        {showLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ProdutoForm
            key={formProduto ? `${formProduto.id}-${formProduto.updatedAt}` : "new"}
            produto={formProduto}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
