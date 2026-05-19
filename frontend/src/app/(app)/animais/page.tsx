"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAnimais, useDeleteAnimal } from "@/lib/hooks/use-animais";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "@/components/shared/search-input";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AnimalDialog } from "@/components/animais/animal-dialog";
import { formatDate, formatIdade } from "@/lib/utils/format";
import type { Animal } from "@/lib/types/animal";

const ESPECIE_ICONS: Record<string, string> = { Cão: "🐕", Gato: "🐈" };
const SEXO_LABELS: Record<string, string> = { M: "Macho", F: "Fêmea", Indefinido: "—" };

export default function AnimaisPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useAnimais({ q: search || undefined, page, limit: 20 });
  const deleteAnimal = useDeleteAnimal();

  function handleEdit(a: Animal) {
    setEditingAnimal(a);
    setDialogOpen(true);
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteAnimal.mutateAsync(deleteId);
      toast.success("Animal excluído com sucesso!");
    } catch {
      toast.error("Erro ao excluir animal.");
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Animais</h1>
          <p className="text-sm text-muted-foreground">Gerenciamento de animais</p>
        </div>
        <Button onClick={() => { setEditingAnimal(undefined); setDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Animal
        </Button>
      </div>

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Buscar por nome ou raça..."
          className="max-w-sm"
        />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Animal</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Espécie / Raça</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Sexo</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Idade</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">Cliente</th>
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
                <tr><td colSpan={6}><EmptyState message="Nenhum animal encontrado" /></td></tr>
              ) : (
                data?.data.map((a) => (
                  <tr key={a.id} className="border-t border-border hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{a.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {ESPECIE_ICONS[a.especie] ?? ""} {a.especie}
                      {a.raca && <span className="text-xs ml-1">· {a.raca}</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{SEXO_LABELS[a.sexo]}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{formatIdade(a.nascimento)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{a.cliente?.nome ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(a)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(a.id)}
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

      <AnimalDialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditingAnimal(undefined); }}
        animal={editingAnimal}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        title="Excluir animal?"
        description="Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        loading={deleteAnimal.isPending}
      />
    </div>
  );
}
