"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Eye, Trash2, Pencil } from "lucide-react";
import { useVendas, useDeleteVenda } from "@/lib/hooks/use-vendas";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDate, formatBRL } from "@/lib/utils/format";

export default function VendasPage() {
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data, isLoading } = useVendas({ page, limit: 20 });
  const deleteVenda = useDeleteVenda();

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteVenda.mutateAsync(deleteId);
      toast.success("Venda excluída com sucesso!");
    } catch {
      toast.error("Erro ao excluir venda.");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Histórico de Vendas</h1>
          <p className="text-sm text-muted-foreground">Registro de vendas realizadas</p>
        </div>
        <Link href="/vendas/nova" className={buttonVariants()}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Venda
        </Link>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Cód.</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Data</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Cliente</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Animal</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Pagamento</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Total</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.data.length === 0 ? (
                <tr><td colSpan={7}><EmptyState message="Nenhuma venda registrada" /></td></tr>
              ) : (
                data?.data.map((v) => (
                  <tr key={v.id} className="border-t border-border hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground hidden sm:table-cell">
                      {v.numero ? `V${String(v.numero).padStart(5, "0")}` : "—"}
                    </td>
                    <td className="px-4 py-3">{formatDate(v.data)}</td>
                    <td className="px-4 py-3 font-medium">{v.cliente?.nome ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{v.animal?.nome ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{v.formaPag}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-primary font-mono block">{formatBRL(v.total)}</span>
                      {v.taxaCartao > 0 && (
                        <span className="text-[10px] text-muted-foreground font-mono block">
                          liq. {formatBRL(v.total * (1 - v.taxaCartao / 100))}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Link href={`/vendas/${v.id}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 w-8 p-0")}>
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link href={`/vendas/${v.id}/editar`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 w-8 p-0")}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <Button
                          variant="ghost" size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(v.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data?.meta && (
          <div className="px-4 pb-4">
            <PaginationBar meta={data.meta} onPageChange={setPage} />
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        title="Excluir venda?"
        description="Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        loading={deleteVenda.isPending}
      />
    </div>
  );
}
