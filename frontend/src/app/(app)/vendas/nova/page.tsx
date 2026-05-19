"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Search, X } from "lucide-react";
import { CreateVendaSchema, type CreateVendaInput } from "@/lib/schemas/venda.schema";
import { useCreateVenda } from "@/lib/hooks/use-vendas";
import { apiClientes } from "@/lib/api/clientes";
import { apiAnimais } from "@/lib/api/animais";
import type { Cliente } from "@/lib/types/cliente";
import type { Animal } from "@/lib/types/animal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormaPagSelect } from "@/components/vendas/forma-pag-select";
import { ItensTable } from "@/components/vendas/itens-table";
import { todayISO } from "@/lib/utils/format";

export default function NovaVendaPage() {
  const router = useRouter();
  const createVenda = useCreateVenda();

  const [clienteQ, setClienteQ] = useState("");
  const [clienteOptions, setClienteOptions] = useState<Cliente[]>([]);
  const [clienteOpen, setClienteOpen] = useState(false);
  const [clienteSelected, setClienteSelected] = useState<Cliente | null>(null);
  const clienteTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [animalQ, setAnimalQ] = useState("");
  const [animalOptions, setAnimalOptions] = useState<Animal[]>([]);
  const [animalOpen, setAnimalOpen] = useState(false);
  const [animalSelected, setAnimalSelected] = useState<Animal | null>(null);
  const animalTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<CreateVendaInput>({
    resolver: zodResolver(CreateVendaSchema),
    defaultValues: { data: todayISO(), itens: [] },
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
    setAnimalSelected(null);
    setAnimalQ("");
    setValue("animalId", null);
  }

  function clearCliente(onChange: (v: string) => void) {
    setClienteSelected(null);
    setClienteQ("");
    setClienteOptions([]);
    setClienteOpen(false);
    onChange("");
    setAnimalSelected(null);
    setAnimalQ("");
    setValue("animalId", null);
  }

  function searchAnimais(q: string) {
    setAnimalQ(q);
    clearTimeout(animalTimer.current);
    if (!q.trim() || !clienteSelected) { setAnimalOptions([]); setAnimalOpen(false); return; }
    animalTimer.current = setTimeout(async () => {
      try {
        const { data } = await apiAnimais.list({ clienteId: clienteSelected.id, q, limit: 8 });
        setAnimalOptions(data);
        setAnimalOpen(data.length > 0);
      } catch {
        setAnimalOptions([]);
      }
    }, 300);
  }

  function selectAnimal(a: Animal, onChange: (v: string | null) => void) {
    setAnimalSelected(a);
    setAnimalQ(a.nome);
    setAnimalOptions([]);
    setAnimalOpen(false);
    onChange(a.id);
  }

  function clearAnimal(onChange: (v: string | null) => void) {
    setAnimalSelected(null);
    setAnimalQ("");
    setAnimalOptions([]);
    setAnimalOpen(false);
    onChange(null);
  }

  async function onSubmit(data: CreateVendaInput) {
    try {
      const venda = await createVenda.mutateAsync(data);
      toast.success("Venda registrada com sucesso!");
      router.push(`/vendas/${venda.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message;
      toast.error("Erro ao registrar venda", { description: msg ?? "Tente novamente." });
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Nova Venda</h1>
          <p className="text-sm text-muted-foreground">Registrar nova venda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-sm font-semibold mb-5">Dados da Venda</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div className="space-y-1.5">
              <Label htmlFor="data">Data *</Label>
              <Input id="data" type="date" {...register("data")} />
            </div>

            <div className="space-y-1.5">
              <Label>Forma de Pagamento *</Label>
              <Controller
                control={control}
                name="formaPag"
                render={({ field }) => (
                  <FormaPagSelect value={field.value} onValueChange={field.onChange} />
                )}
              />
              {errors.formaPag && (
                <p className="text-xs text-destructive">{errors.formaPag.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
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
              {errors.clienteId && (
                <p className="text-xs text-destructive">{errors.clienteId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Animal</Label>
              <Controller
                control={control}
                name="animalId"
                render={({ field }) => (
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        value={animalQ}
                        onChange={(e) => {
                          if (animalSelected) {
                            setAnimalSelected(null);
                            field.onChange(null);
                          }
                          searchAnimais(e.target.value);
                        }}
                        onBlur={() => setTimeout(() => setAnimalOpen(false), 150)}
                        placeholder={clienteSelected ? "Buscar animal pelo nome..." : "Selecione um cliente primeiro"}
                        disabled={!clienteSelected}
                        className="pl-9 pr-8"
                      />
                      {animalSelected && (
                        <button
                          type="button"
                          onClick={() => clearAnimal(field.onChange)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {animalOpen && animalOptions.length > 0 && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                        {animalOptions.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent transition-colors border-b border-border last:border-0"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => selectAnimal(a, field.onChange)}
                          >
                            <p className="font-medium">{a.nome}</p>
                            <p className="text-xs text-muted-foreground">{a.especie}{a.raca ? ` · ${a.raca}` : ""}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="obs">Observações</Label>
              <Textarea id="obs" {...register("obs")} rows={2} placeholder="Observações sobre a venda..." />
            </div>

          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <ItensTable
            control={control as unknown as Parameters<typeof ItensTable>[0]["control"]}
            setValue={setValue as unknown as Parameters<typeof ItensTable>[0]["setValue"]}
            errors={errors.itens as Parameters<typeof ItensTable>[0]["errors"]}
          />
          {errors.itens && typeof errors.itens.message === "string" && (
            <p className="text-xs text-destructive mt-2">{errors.itens.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pb-8">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createVenda.isPending}>
            {createVenda.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Registrando...</>
            ) : (
              "Registrar Venda"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
