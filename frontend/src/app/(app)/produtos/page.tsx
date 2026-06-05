"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useProdutos, useDeleteProduto } from "@/lib/hooks/use-produtos";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "@/components/shared/search-input";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ProdutoDialog } from "@/components/produtos/produto-dialog";
import { ProdutoInfoDialog } from "@/components/produtos/produto-info-dialog";
import { formatBRL } from "@/lib/utils/format";
import type { Produto } from "@/lib/types/produto";

export default function ProdutosPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [infoProduto, setInfoProduto] = useState<Produto | null>(null);

  const { data, isLoading } = useProdutos({ q: search || undefined, page, limit: 20 });
  const deleteProduto = useDeleteProduto();

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteProduto.mutateAsync(deleteId);
      toast.success("Produto excluído com sucesso!");
    } catch {
      toast.error("Erro ao excluir produto.");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Produtos</h1>
          <p className="text-sm text-muted-foreground">Catálogo de produtos</p>
        </div>
        <Button onClick={() => { setEditingProduto(undefined); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Buscar por nome, marca..."
          className="max-w-sm"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Produto</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Marca</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Custo</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Venda</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Margem</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.data.length === 0 ? (
                <tr><td colSpan={7}><EmptyState message="Nenhum produto encontrado" /></td></tr>
              ) : (
                data?.data.map((p) => {
                  const margem = p.valorVenda > 0
                    ? ((p.valorVenda - p.valorCusto) / p.valorVenda) * 100
                    : 0;
                  return (
                    <tr key={p.id} className="border-t border-border hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.imagemUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.imagemUrl}
                              alt={p.nome}
                              className="w-24 h-24 rounded-xl object-cover border border-border shrink-0 shadow-sm"
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-xl bg-muted border border-border flex items-center justify-center text-3xl shrink-0">
                              📦
                            </div>
                          )}
                          <span className="font-medium">{p.nome}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.categoria}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{p.marca ?? "—"}</td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">{formatBRL(p.valorCusto)}</td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">{formatBRL(p.valorVenda)}</td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className={`text-xs font-bold font-mono ${margem >= 30 ? "text-primary" : margem >= 15 ? "text-amber-600" : "text-destructive"}`}>
                          {margem.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground" onClick={() => setInfoProduto(p)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setEditingProduto(p); setDialogOpen(true); }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(p.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      <ProdutoDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingProduto(undefined); }}
        produto={editingProduto}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        title="Excluir produto?"
        description="O produto será marcado como excluído. Vendas e orçamentos já realizados são mantidos."
        onConfirm={handleDelete}
        loading={deleteProduto.isPending}
      />
      <ProdutoInfoDialog
        produto={infoProduto}
        onOpenChange={(o) => { if (!o) setInfoProduto(null); }}
      />
    </div>
  );
}
