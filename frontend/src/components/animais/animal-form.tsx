"use client";

import { useState, useRef } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateAnimalSchema, type CreateAnimalInput } from "@/lib/schemas/animal.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Search, X } from "lucide-react";
import type { Animal } from "@/lib/types/animal";
import type { Cliente } from "@/lib/types/cliente";
import { apiClientes } from "@/lib/api/clientes";

interface AnimalFormProps {
  defaultValues?: Partial<CreateAnimalInput>;
  onSubmit: (data: CreateAnimalInput) => void;
  onCancel: () => void;
  isLoading?: boolean;
  animal?: Animal;
  fixedClienteId?: string;
}

export function AnimalForm({ defaultValues, onSubmit, onCancel, isLoading, animal, fixedClienteId }: AnimalFormProps) {
  const showClienteSelector = !fixedClienteId && !animal;

  const [clienteQ, setClienteQ] = useState("");
  const [clienteOptions, setClienteOptions] = useState<Cliente[]>([]);
  const [clienteOpen, setClienteOpen] = useState(false);
  const [clienteSelected, setClienteSelected] = useState<Cliente | null>(null);
  const clienteTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { register, handleSubmit, control, formState: { errors } } = useForm<CreateAnimalInput>({
    resolver: zodResolver(CreateAnimalSchema) as Resolver<CreateAnimalInput>,
    defaultValues: defaultValues ?? {
      nome: animal?.nome ?? "",
      clienteId: fixedClienteId ?? animal?.clienteId ?? "",
      especie: animal?.especie,
      raca: animal?.raca ?? "",
      sexo: animal?.sexo ?? "Indefinido",
      nascimento: animal?.nascimento?.slice(0, 10) ?? "",
      peso: animal?.peso ?? undefined,
      obs: animal?.obs ?? "",
    },
  });

  function searchClientes(q: string) {
    setClienteQ(q);
    clearTimeout(clienteTimer.current);
    if (!q.trim()) { setClienteOptions([]); setClienteOpen(false); return; }
    clienteTimer.current = setTimeout(async () => {
      try {
        const { data } = await apiClientes.list({ q, limit: 8 });
        setClienteOptions(data);
        setClienteOpen(data.length > 0);
      } catch {
        setClienteOptions([]);
      }
    }, 300);
  }

  function selectCliente(c: Cliente, onChange: (v: string) => void) {
    setClienteSelected(c);
    setClienteQ(c.nome);
    setClienteOptions([]);
    setClienteOpen(false);
    onChange(c.id);
  }

  function clearCliente(onChange: (v: string) => void) {
    setClienteSelected(null);
    setClienteQ("");
    setClienteOptions([]);
    setClienteOpen(false);
    onChange("");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {showClienteSelector && (
          <div className="space-y-1.5 col-span-2">
            <Label>Cliente *</Label>
            <Controller
              control={control}
              name="clienteId"
              render={({ field }) => (
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      value={clienteQ}
                      onChange={(e) => {
                        if (clienteSelected) {
                          setClienteSelected(null);
                          field.onChange("");
                        }
                        searchClientes(e.target.value);
                      }}
                      onBlur={() => setTimeout(() => setClienteOpen(false), 150)}
                      placeholder="Buscar cliente pelo nome..."
                      className="pl-9 pr-8"
                    />
                    {clienteSelected && (
                      <button
                        type="button"
                        onClick={() => clearCliente(field.onChange)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {clienteOpen && clienteOptions.length > 0 && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                      {clienteOptions.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent transition-colors border-b border-border last:border-0"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => selectCliente(c, field.onChange)}
                        >
                          <p className="font-medium">{c.nome}</p>
                          <p className="text-xs text-muted-foreground">{c.cidade}{c.telefone ? ` · ${c.telefone}` : ""}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            />
            {errors.clienteId && <p className="text-xs text-destructive">{errors.clienteId.message}</p>}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" {...register("nome")} placeholder="Nome do animal" />
          {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Espécie *</Label>
          <Controller
            control={control}
            name="especie"
            render={({ field }) => (
              <Select onValueChange={(v) => { if (v !== null) field.onChange(v); }} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cão">Cão</SelectItem>
                  <SelectItem value="Gato">Gato</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.especie && <p className="text-xs text-destructive">{errors.especie.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="raca">Raça</Label>
          <Input id="raca" {...register("raca")} placeholder="Labrador, SRD..." />
        </div>

        <div className="space-y-1.5">
          <Label>Sexo</Label>
          <Controller
            control={control}
            name="sexo"
            render={({ field }) => (
              <Select onValueChange={(v) => { if (v !== null) field.onChange(v); }} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Macho</SelectItem>
                  <SelectItem value="F">Fêmea</SelectItem>
                  <SelectItem value="Indefinido">Indefinido</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="nascimento">Nascimento</Label>
          <Input id="nascimento" type="date" {...register("nascimento")} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="peso">Peso (kg)</Label>
          <Input
            id="peso"
            type="number"
            step="0.1"
            min="0"
            {...register("peso", { valueAsNumber: true })}
            placeholder="0.0"
          />
        </div>

        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="obs">Observações</Label>
          <Textarea id="obs" {...register("obs")} placeholder="Observações sobre o animal..." rows={2} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
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
