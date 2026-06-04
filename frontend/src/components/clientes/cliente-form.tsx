"use client";

import { useState, useRef } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateClienteSchema, type CreateClienteInput } from "@/lib/schemas/cliente.schema";
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
import { Loader2, PawPrint, Plus, Trash2 } from "lucide-react";
import type { Cliente, AnimalSummary } from "@/lib/types/cliente";

export interface AnimalDraft {
  nome: string;
  especie: "Cão" | "Gato" | "";
  raca: string;
  sexo: "M" | "F" | "Indefinido";
  nascimento: string;
  peso: string;
}

const ANIMAL_VAZIO: AnimalDraft = {
  nome: "", especie: "", raca: "", sexo: "Indefinido", nascimento: "", peso: "",
};

interface ClienteFormProps {
  defaultValues?: Partial<CreateClienteInput>;
  onSubmit: (data: CreateClienteInput, animais: AnimalDraft[]) => void;
  onCancel: () => void;
  isLoading?: boolean;
  cliente?: Cliente;
  existingAnimais?: AnimalSummary[];
  onDeleteExistingAnimal?: (id: string) => void;
}

export function ClienteForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
  cliente,
  existingAnimais = [],
  onDeleteExistingAnimal,
}: ClienteFormProps) {
  const [animais, setAnimais] = useState<AnimalDraft[]>([]);
  const especieRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sexoRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateClienteInput>({
    resolver: zodResolver(CreateClienteSchema) as Resolver<CreateClienteInput>,
    defaultValues: defaultValues ?? {
      cidade: "Manaus",
      nome: cliente?.nome ?? "",
      telefone: cliente?.telefone ?? "",
      email: cliente?.email ?? "",
      cpf: cliente?.cpf ?? "",
      endereco: cliente?.endereco ?? "",
      bairro: cliente?.bairro ?? "",
      obs: cliente?.obs ?? "",
    },
  });

  function addAnimal() {
    setAnimais((prev) => [...prev, { ...ANIMAL_VAZIO }]);
  }

  function removeAnimal(idx: number) {
    setAnimais((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateAnimal(idx: number, field: keyof AnimalDraft, value: string) {
    setAnimais((prev) => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  }

  function handleFormSubmit(data: CreateClienteInput) {
    const animaisValidos = animais.filter((a) => a.nome.trim() && a.especie);
    onSubmit(data, animaisValidos);
  }

  const SEXO_LABEL: Record<string, string> = { M: "Macho", F: "Fêmea", Indefinido: "Indefinido" };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">

      {/* ── Dados do Cliente ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" {...register("nome")} placeholder="Nome completo" />
          {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="telefone">Telefone *</Label>
          <Input
            id="telefone"
            placeholder="(92) 9 9999-9999"
            maxLength={16}
            {...register("telefone")}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
              let masked = digits;
              if (digits.length > 7) masked = `(${digits.slice(0, 2)}) ${digits[2]} ${digits.slice(3, 7)}-${digits.slice(7)}`;
              else if (digits.length > 2) masked = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
              else if (digits.length > 0) masked = `(${digits}`;
              e.target.value = masked;
              register("telefone").onChange(e);
            }}
          />
          {errors.telefone && <p className="text-xs text-destructive">{errors.telefone.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" {...register("email")} placeholder="email@exemplo.com" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" {...register("cpf")} placeholder="Somente números" maxLength={11} inputMode="numeric" />
        </div>

        <div className="space-y-1.5 col-span-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input id="endereco" {...register("endereco")} placeholder="Rua, número" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bairro">Bairro</Label>
          <Input id="bairro" {...register("bairro")} placeholder="Ex: Adrianópolis" />
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

      {/* ── Seção de Animais ── */}
      <div className="pt-1 border-t border-border/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <PawPrint className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
              Animais <span className="font-normal normal-case opacity-60">(opcional)</span>
            </span>
          </div>
          <Button type="button" size="sm" variant="outline" onClick={addAnimal} className="h-7 text-xs gap-1">
            <Plus className="w-3 h-3" />
            Adicionar
          </Button>
        </div>

        {/* Animais já cadastrados (modo edição) */}
        {existingAnimais.map((a) => (
          <div key={a.id} className="flex items-center justify-between border border-border/50 rounded-md px-3 py-2.5 bg-muted/20 mb-2">
            <div className="flex items-center gap-2.5">
              <span className="text-base leading-none">{a.especie === "Cão" ? "🐕" : a.especie === "Gato" ? "🐈" : "🐾"}</span>
              <div>
                <p className="text-sm font-medium leading-tight">{a.nome}</p>
                <p className="text-[11px] text-muted-foreground">
                  {a.especie}{a.raca ? ` · ${a.raca}` : ""}
                </p>
              </div>
            </div>
            {onDeleteExistingAnimal && (
              <Button
                type="button" size="sm" variant="ghost"
                className="h-6 w-6 p-0 text-destructive/60 hover:text-destructive"
                onClick={() => onDeleteExistingAnimal(a.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        ))}

        {existingAnimais.length === 0 && animais.length === 0 && (
          <p className="text-[11px] text-muted-foreground/60 text-center py-3 border border-dashed border-border/50 rounded-md">
            Nenhum animal adicionado ainda.
          </p>
        )}

        {/* Novos animais a cadastrar */}
        {animais.map((animal, idx) => (
          <div key={idx} className="border border-border/50 rounded-md p-4 space-y-3 bg-muted/20 mb-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Animal {idx + 1}</span>
              <Button type="button" size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive/60 hover:text-destructive" onClick={() => removeAnimal(idx)}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1.5">
                <Label>Nome *</Label>
                <Input value={animal.nome} onChange={(e) => updateAnimal(idx, "nome", e.target.value)} placeholder="Nome do animal" />
              </div>

              <div className="space-y-1.5">
                <Label>Espécie *</Label>
                <Select value={animal.especie} onValueChange={(v) => updateAnimal(idx, "especie", v)}>
                  <SelectTrigger ref={(el) => { especieRefs.current[idx] = el; }}>
                    {animal.especie
                      ? <span className="flex flex-1 text-left text-sm">{animal.especie}</span>
                      : <SelectValue placeholder="Selecione..." />}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cão">Cão</SelectItem>
                    <SelectItem value="Gato">Gato</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Raça</Label>
                <Input value={animal.raca} onChange={(e) => updateAnimal(idx, "raca", e.target.value)} placeholder="Labrador, SRD..." />
              </div>

              <div className="space-y-1.5">
                <Label>Sexo</Label>
                <Select value={animal.sexo} onValueChange={(v) => updateAnimal(idx, "sexo", v)}>
                  <SelectTrigger ref={(el) => { sexoRefs.current[idx] = el; }}>
                    <span className="flex flex-1 text-left text-sm">{SEXO_LABEL[animal.sexo]}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Macho</SelectItem>
                    <SelectItem value="F">Fêmea</SelectItem>
                    <SelectItem value="Indefinido">Indefinido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Nascimento</Label>
                <Input type="date" value={animal.nascimento} onChange={(e) => updateAnimal(idx, "nascimento", e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <Label>Peso (kg)</Label>
                <Input type="number" step="0.1" min="0" value={animal.peso} onChange={(e) => updateAnimal(idx, "peso", e.target.value)} placeholder="0.0" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-4 mt-1 border-t border-border/60">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading} className="text-muted-foreground">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</> : "Salvar"}
        </Button>
      </div>
    </form>
  );
}
