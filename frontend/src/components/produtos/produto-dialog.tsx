"use client";

import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProdutoForm } from "./produto-form";
import { useCreateProduto, useUpdateProduto } from "@/lib/hooks/use-produtos";
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

  async function onSubmit(data: CreateProdutoInput & { imagemUrl?: string | null }) {
    try {
      const payload = Object.fromEntries(
        Object.entries(data).filter(([k, v]) => k === "imagemUrl" ? v !== undefined : v !== "" && v !== undefined)
      ) as CreateProdutoInput;

      if (produto) {
        await update.mutateAsync({ id: produto.id, input: payload });
        toast.success("Produto atualizado com sucesso!");
      } else {
        await create.mutateAsync(payload);
        toast.success("Produto cadastrado com sucesso!");
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message;
      toast.error("Erro ao salvar produto", { description: msg ?? "Tente novamente." });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[940px] sm:p-8 max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{produto ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>
        <ProdutoForm
          produto={produto}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
