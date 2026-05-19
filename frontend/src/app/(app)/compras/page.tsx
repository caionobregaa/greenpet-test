"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Eye, Trash2 } from "lucide-react";
import { useCompras, useDeleteCompra, useCreateCompra } from "@/lib/hooks/use-compras";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusPill } from "@/components/shared/status-pill";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateCompraSchema, type CreateCompraInput } from "@/lib/schemas/compra.schema";
import { ItensTable } from "@/components/vendas/itens-table";
import { formatDate, formatBRL, todayISO } from "@/lib/utils/format";
import { Loader2 } from "lucide-react";

function NovaCompraDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const create = useCreateCompra();
  const { register, handleSubmit, control, setValue, formState: { errors }, reset } = useForm<CreateCompraInput>({
    resolver: zodResolver(CreateCompraSchema),
    defaultValues: { dataPedido: todayISO(), itens: [] },
  });

  async function onSubmit(data: CreateCompraInput) {
    try {
      await create.mutateAsync(data);
      toast.success("Compra registrada com sucesso!");
      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error("Erro ao registrar compra", { description: msg });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Compra</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fornecedor">Fornecedor *</Label>
              <Input {...register("fornecedor")} placeholder="Nome do fornecedor" />
              {errors.fornecedor && <p className="text-xs text-destructive">{errors.fornecedor.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dataPedido">Data do Pedido</Label>
              <Input type="date" {...register("dataPedido")} />
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
              {create.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</> : "Registrar Compra"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ComprasPage() {
  const [page, setPage] = useState(1);
  const [newOpen, setNewOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading } = useCompras({ page, limit: 20 });
  const deleteCompra = useDeleteCompra();

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteCompra.mutateAsync(deleteId); toast.success("Compra excluída!"); }
    catch { toast.error("Erro ao excluir compra."); }
    finally { setDeleteId(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Compras</h1>
          <p className="text-sm text-muted-foreground">Pedidos de compra e fornecedores</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />Nova Compra
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Fornecedor</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Data Pedido</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Total</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-border">
                  {Array.from({ length: 5 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                </tr>
              )) : data?.data.length === 0 ? (
                <tr><td colSpan={5}><EmptyState message="Nenhuma compra registrada" /></td></tr>
              ) : data?.data.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{c.fornecedor}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatDate(c.dataPedido)}</td>
                  <td className="px-4 py-3"><StatusPill status={c.status} /></td>
                  <td className="px-4 py-3 text-right font-bold text-primary font-mono">{formatBRL(c.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link href={`/compras/${c.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 w-8 p-0")}>
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => setDeleteId(c.id)}>
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

      <NovaCompraDialog open={newOpen} onOpenChange={setNewOpen} />
      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }} title="Excluir compra?" description="Esta ação não pode ser desfeita." onConfirm={handleDelete} loading={deleteCompra.isPending} />
    </div>
  );
}
