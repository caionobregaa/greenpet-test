"use client";

import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClienteForm, type AnimalDraft } from "./cliente-form";
import { useCreateCliente, useUpdateCliente } from "@/lib/hooks/use-clientes";
import { useCreateAnimal, useDeleteAnimal, useAnimais } from "@/lib/hooks/use-animais";
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
  const createAnimal = useCreateAnimal();
  const deleteAnimal = useDeleteAnimal();

  const { data: animaisData } = useAnimais(
    { clienteId: cliente?.id, limit: 50 },
  );

  const isLoading = create.isPending || update.isPending;

  async function onSubmit(data: CreateClienteInput, animais: AnimalDraft[]) {
    try {
      let clienteId: string;

      if (cliente) {
        await update.mutateAsync({ id: cliente.id, input: data });
        clienteId = cliente.id;
        toast.success("Cliente atualizado com sucesso!");
      } else {
        const novoCliente = await create.mutateAsync(data);
        clienteId = novoCliente.id;
      }

      if (animais.length > 0) {
        const resultados = await Promise.allSettled(
          animais.map((a) =>
            createAnimal.mutateAsync({
              clienteId,
              nome: a.nome,
              especie: a.especie as "Cão" | "Gato",
              raca: a.raca || undefined,
              sexo: a.sexo,
              nascimento: a.nascimento || undefined,
              peso: a.peso ? parseFloat(a.peso) : undefined,
            })
          )
        );

        const falhas = resultados.filter((r) => r.status === "rejected").length;
        if (!cliente) {
          if (falhas > 0) {
            toast.success("Cliente cadastrado!", {
              description: `${animais.length - falhas} animal(is) cadastrado(s). ${falhas} falhou.`,
            });
          } else {
            toast.success("Cliente e animal(is) cadastrados com sucesso!");
          }
        } else if (falhas === 0) {
          toast.success(`${animais.length} animal(is) adicionado(s) com sucesso!`);
        }
      } else if (!cliente) {
        toast.success("Cliente cadastrado com sucesso!");
      }

      onOpenChange(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message;
      toast.error("Erro ao salvar cliente", { description: msg ?? "Tente novamente." });
    }
  }

  async function handleDeleteAnimal(id: string) {
    try {
      await deleteAnimal.mutateAsync(id);
      toast.success("Animal removido.");
    } catch {
      toast.error("Erro ao remover animal.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] sm:p-8 max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{cliente ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>
        <ClienteForm
          cliente={cliente}
          existingAnimais={animaisData?.data ?? []}
          onDeleteExistingAnimal={cliente ? handleDeleteAnimal : undefined}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
