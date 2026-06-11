"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, X } from "lucide-react";
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

const CATEGORIAS = ["Ração", "Petisco", "Suplemento", "Medicamento", "Acessório", "Higiene", "Serviço"];
const ESPECIES   = ["Cão", "Gato", "Cão e Gato", "Ambos"];
const FORNECEDORES = ["PRIME", "Basso Pancotte", "Central Pec", "Market", "Zoo Center"];

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 pl-3 pr-8 rounded-md border border-input bg-background text-sm text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
      >
        <option value="">{label}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function ProdutosPage() {
  const [search, setSearch]         = useState("");
  const [categoria, setCategoria]   = useState("");
  const [especie, setEspecie]       = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [page, setPage]             = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Produto | undefined>();
  const [deleteId, setDeleteId]     = useState<string | null>(null);
  const [infoProduto, setInfoProduto] = useState<Produto | null>(null);

  function resetFilters() {
    setSearch(""); setCategoria(""); setEspecie(""); setFornecedor(""); setPage(1);
  }

  const hasFilters = !!(search || categoria || especie || fornecedor);

  const { data, isLoading, isError } = useProdutos({
    q: search || undefined,
    categoria: categoria || undefined,
    especie: especie || undefined,
    fornecedor: fornecedor || undefined,
    page,
    limit: 20,
  });
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

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Buscar por nome, marca..."
          className="max-w-xs"
        />
        <FilterSelect
          label="Distribuidora"
          value={fornecedor}
          onChange={(v) => { setFornecedor(v); setPage(1); }}
          options={FORNECEDORES}
        />
        <FilterSelect
          label="Categoria"
          value={categoria}
          onChange={(v) => { setCategoria(v); setPage(1); }}
          options={CATEGORIAS}
        />
        <FilterSelect
          label="Espécie"
          value={especie}
          onChange={(v) => { setEspecie(v); setPage(1); }}
          options={ESPECIES}
        />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground gap-1">
            <X className="w-3.5 h-3.5" />
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Produto</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Categoria</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Distribuidora</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Custo</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Venda</th>
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
              ) : isError ? (
                <tr><td colSpan={6}><EmptyState message="Erro ao carregar produtos" description="Verifique a conexão com o servidor." /></td></tr>
              ) : data?.data.length === 0 ? (
                <tr><td colSpan={6}><EmptyState message="Nenhum produto encontrado" /></td></tr>
              ) : (
                data?.data.map((p) => (
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
                        <div>
                          <p className="font-medium">{p.nome}</p>
                          {p.marca && <p className="text-xs text-muted-foreground">{p.marca}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      <div>{p.categoria}</div>
                      {p.especie && <div className="text-xs text-muted-foreground/70">{p.especie}</div>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{p.fornecedor ?? "—"}</td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">{formatBRL(p.valorCusto)}</td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">{formatBRL(p.valorVenda)}</td>
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
