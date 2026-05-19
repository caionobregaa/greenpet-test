"use client";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClienteForm } from "./cliente-form";
import { useCreateCliente, useUpdateCliente } from "@/lib/hooks/use-clientes";
import type { Cliente } from "@/lib/types/cliente";
import type { CreateClienteInput } from "@/lib/schemas/cliente.schema";

interface ClienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente?: Cliente;
}

export function ClienteDialog({ open, onOpenChange, cliente }: ClienteDialogProps) {
  const create = useCreateCliente();
  const update = useUpdateCliente();
  const isLoading = create.isPending || update.isPending;

  async function onSubmit(data: CreateClienteInput) {
    try {
      if (cliente) {
        await update.mutateAsync({ id: cliente.id, input: data });
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await create.mutateAsync(data);
        toast.success("Cliente cadastrado com sucesso!");
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message;
      toast.error("Erro ao salvar cliente", { description: msg ?? "Tente novamente." });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl sm:p-6 max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>
        <ClienteForm
          cliente={cliente}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
