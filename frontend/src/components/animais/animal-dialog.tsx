"use client";

import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnimalForm } from "./animal-form";
import { useCreateAnimal, useUpdateAnimal } from "@/lib/hooks/use-animais";
import type { Animal } from "@/lib/types/animal";
import type { CreateAnimalInput } from "@/lib/schemas/animal.schema";

interface AnimalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animal?: Animal;
  fixedClienteId?: string;
}

export function AnimalDialog({ open, onOpenChange, animal, fixedClienteId }: AnimalDialogProps) {
  const create = useCreateAnimal();
  const update = useUpdateAnimal();
  const isLoading = create.isPending || update.isPending;

  async function onSubmit(data: CreateAnimalInput) {
    try {
      const payload = {
        ...data,
        nascimento: data.nascimento || undefined,
        raca: data.raca || undefined,
        obs: data.obs || undefined,
      };
      if (animal) {
        await update.mutateAsync({ id: animal.id, input: payload });
        toast.success("Animal atualizado com sucesso!");
      } else {
        await create.mutateAsync(payload);
        toast.success("Animal cadastrado com sucesso!");
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message;
      toast.error("Erro ao salvar animal", { description: msg ?? "Tente novamente." });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{animal ? "Editar Animal" : "Novo Animal"}</DialogTitle>
        </DialogHeader>
        <AnimalForm
          animal={animal}
          fixedClienteId={fixedClienteId}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
