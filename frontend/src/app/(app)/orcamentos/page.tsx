"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Eye, Trash2 } from "lucide-react";
import { useOrcamentos, useDeleteOrcamento, useCreateOrcamento } from "@/lib/hooks/use-orcamentos";
import { useClientes } from "@/lib/hooks/use-clientes";
import { useAnimais } from "@/lib/hooks/use-animais";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill } from "@/components/shared/status-pill";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateOrcamentoSchema, type CreateOrcamentoInput } from "@/lib/schemas/orcamento.schema";
import { ItensTable } from "@/components/vendas/itens-table";
import { formatDate, formatBRL, todayISO } from "@/lib/utils/format";
import { Loader2 } from "lucide-react";

function NovoOrcamentoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const create = useCreateOrcamento();
  const [clienteId, setClienteId] = useState("");
  const { data: clientesData } = useClientes({ limit: 100 });
  const { data: animaisData } = useAnimais({ clienteId: clienteId || undefined, limit: 50 });

  const { register, handleSubmit, control, setValue, formState: { errors }, reset } = useForm<CreateOrcamentoInput>({
    resolver: zodResolver(CreateOrcamentoSchema),
    defaultValues: { data: todayISO(), itens: [] },
  });

  async function onSubmit(data: CreateOrcamentoInput) {
    try {
      await create.mutateAsync(data);
      toast.success("Orçamento criado com sucesso!");
      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error("Erro ao criar orçamento", { description: msg });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Orçamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Cliente *</Label>
              <Controller control={control} name="clienteId" render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => { field.onChange(v ?? ""); setClienteId(v ?? ""); setValue("animalId", null); }}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{clientesData?.data.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {errors.clienteId && <p className="text-xs text-destructive">{errors.clienteId.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Animal</Label>
              <Controller control={control} name="animalId" render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || null)} disabled={!clienteId}>
                  <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {animaisData?.data.map((a) => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data">Data</Label>
              <Input type="date" {...register("data")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="validade">Validade *</Label>
              <Input type="date" {...register("validade")} />
              {errors.validade && <p className="text-xs text-destructive">{errors.validade.message}</p>}
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="obs">Observações</Label>
              <Textarea {...register("obs")} rows={2} />
            </div>
          </div>
          <ItensTable
            control={control as unknown as Parameters<typeof ItensTable>[0]["control"]}
            setValue={setValue as unknown as Parameters<typeof ItensTable>[0]["setValue"]}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</> : "Salvar Orçamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function OrcamentosPage() {
  const [page, setPage] = useState(1);
  const [newOpen, setNewOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading } = useOrcamentos({ page, limit: 20 });
  const deleteOrcamento = useDeleteOrcamento();

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteOrcamento.mutateAsync(deleteId); toast.success("Orçamento excluído!"); }
    catch { toast.error("Erro ao excluir orçamento."); }
    finally { setDeleteId(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Orçamentos</h1>
          <p className="text-sm text-muted-foreground">Gerenciamento de orçamentos</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />Novo Orçamento
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Data</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Cliente</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Validade</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Total</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-border">
                  {Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                </tr>
              )) : data?.data.length === 0 ? (
                <tr><td colSpan={6}><EmptyState message="Nenhum orçamento encontrado" /></td></tr>
              ) : data?.data.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">{formatDate(o.data)}</td>
                  <td className="px-4 py-3 font-medium">{o.cliente?.nome ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDate(o.validade)}</td>
                  <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                  <td className="px-4 py-3 text-right font-bold text-primary font-mono">{formatBRL(o.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link href={`/orcamentos/${o.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 w-8 p-0")}>
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteId(o.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.meta && <div className="px-4 pb-4"><PaginationBar meta={data.meta} onPageChange={setPage} /></div>}
      </div>

      <NovoOrcamentoDialog open={newOpen} onOpenChange={setNewOpen} />
      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }} title="Excluir orçamento?" description="Esta ação não pode ser desfeita." onConfirm={handleDelete} loading={deleteOrcamento.isPending} />
    </div>
  );
}
