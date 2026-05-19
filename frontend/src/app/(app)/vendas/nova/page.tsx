"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CreateVendaSchema, type CreateVendaInput } from "@/lib/schemas/venda.schema";
import { useCreateVenda } from "@/lib/hooks/use-vendas";
import { useClientes } from "@/lib/hooks/use-clientes";
import { useAnimais } from "@/lib/hooks/use-animais";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormaPagSelect } from "@/components/vendas/forma-pag-select";
import { ItensTable } from "@/components/vendas/itens-table";
import { todayISO } from "@/lib/utils/format";

export default function NovaVendaPage() {
  const router = useRouter();
  const createVenda = useCreateVenda();
  const [clienteId, setClienteId] = useState<string>("");

  const { data: clientesData } = useClientes({ limit: 100 });
  const { data: animaisData } = useAnimais({ clienteId: clienteId || undefined, limit: 50 });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateVendaInput>({
    resolver: zodResolver(CreateVendaSchema),
    defaultValues: {
      data: todayISO(),
      itens: [],
    },
  });

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
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Nova Venda</h1>
          <p className="text-sm text-muted-foreground">Registrar nova venda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
        {/* Cabeçalho */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Dados da Venda</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="data">Data *</Label>
              <Input id="data" type="date" {...register("data")} />
            </div>

            <div className="space-y-1.5">
              <Label>Cliente *</Label>
              <Controller
                control={control}
                name="clienteId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v ?? "");
                      setClienteId(v ?? "");
                      setValue("animalId", null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {clientesData?.data.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v || null)}
                    disabled={!clienteId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={clienteId ? "Selecione o animal..." : "Selecione um cliente primeiro"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Nenhum</SelectItem>
                      {animaisData?.data.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
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

            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="obs">Observações</Label>
              <Textarea id="obs" {...register("obs")} rows={2} placeholder="Observações sobre a venda..." />
            </div>
          </div>
        </div>

        {/* Itens */}
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <ItensTable
            control={control as unknown as Parameters<typeof ItensTable>[0]["control"]}
            setValue={setValue as unknown as Parameters<typeof ItensTable>[0]["setValue"]}
            errors={errors.itens as Parameters<typeof ItensTable>[0]["errors"]}
          />
          {errors.itens && typeof errors.itens.message === "string" && (
            <p className="text-xs text-destructive mt-2">{errors.itens.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
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
