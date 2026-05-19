"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateClienteSchema, type CreateClienteInput } from "@/lib/schemas/cliente.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Cliente } from "@/lib/types/cliente";

interface ClienteFormProps {
  defaultValues?: Partial<CreateClienteInput>;
  onSubmit: (data: CreateClienteInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  cliente?: Cliente;
}

export function ClienteForm({ defaultValues, onSubmit, onCancel, isLoading, cliente }: ClienteFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateClienteInput>({
    resolver: zodResolver(CreateClienteSchema) as Resolver<CreateClienteInput>,
    defaultValues: defaultValues ?? {
      cidade: "Manaus",
      nome: cliente?.nome ?? "",
      telefone: cliente?.telefone ?? "",
      email: cliente?.email ?? "",
      cpf: cliente?.cpf ?? "",
      endereco: cliente?.endereco ?? "",
      obs: cliente?.obs ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" {...register("nome")} placeholder="Nome completo" />
          {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="telefone">Telefone *</Label>
          <Input id="telefone" {...register("telefone")} placeholder="(92) 9 9999-9999" />
          {errors.telefone && <p className="text-xs text-destructive">{errors.telefone.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" {...register("email")} placeholder="email@exemplo.com" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" {...register("cpf")} placeholder="000.000.000-00" />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input id="endereco" {...register("endereco")} placeholder="Rua, número, bairro" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cidade">Cidade</Label>
          <Input id="cidade" {...register("cidade")} placeholder="Manaus" />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="obs">Observações</Label>
          <Textarea id="obs" {...register("obs")} placeholder="Observações sobre o cliente..." rows={2} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</> : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
