"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { useAnimais, useDeleteAnimal } from "@/lib/hooks/use-animais";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "@/components/shared/search-input";
import { PaginationBar } from "@/components/shared/pagination-bar";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { AnimalDialog } from "@/components/animais/animal-dialog";
import { formatDate, formatIdade } from "@/lib/utils/format";
import { apiClientes } from "@/lib/api/clientes";
import type { Animal } from "@/lib/types/animal";
import type { Cliente } from "@/lib/types/cliente";

const ESPECIE_ICONS: Record<string, string> = { Cão: "🐕", Gato: "🐈" };
const SEXO_LABELS: Record<string, string> = { M: "Macho", F: "Fêmea", Indefinido: "—" };

export default function AnimaisPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filtros
  const [especieFiltro, setEspecieFiltro] = useState("");
  const [sexoFiltro, setSexoFiltro] = useState("");

  // Filtro por cliente
  const [clienteSearch, setClienteSearch] = useState("");
  const [clienteOptions, setClienteOptions] = useState<Cliente[]>([]);
  const [clienteDropdownOpen, setClienteDropdownOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const clienteTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { data, isLoading } = useAnimais({
    q: search || undefined,
    clienteId: clienteSelecionado?.id,
    especie: especieFiltro || undefined,
    sexo: sexoFiltro || undefined,
    page,
    limit: 20,
  });
  const deleteAnimal = useDeleteAnimal();

  function buscarClientes(q: string) {
    setClienteSearch(q);
    clearTimeout(clienteTimer.current);
    if (!q.trim()) { setClienteOptions([]); setClienteDropdownOpen(false); return; }
    clienteTimer.current = setTimeout(async () => {
      try {
        const { data } = await apiClientes.list({ q, limit: 8 });
        setClienteOptions(data);
        setClienteDropdownOpen(data.length > 0);
      } catch {
        setClienteOptions([]);
      }
    }, 300);
  }

  function selecionarCliente(c: Cliente) {
    setClienteSelecionado(c);
    setClienteSearch(c.nome);
    setClienteOptions([]);
    setClienteDropdownOpen(false);
    setPage(1);
  }

  function limparCliente() {
    setClienteSelecionado(null);
    setClienteSearch("");
    setClienteOptions([]);
    setClienteDropdownOpen(false);
    setPage(1);
  }

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

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder="Buscar por nome ou raça..."
          className="max-w-sm"
        />

        <select
          value={especieFiltro}
          onChange={(e) => { setEspecieFiltro(e.target.value); setPage(1); }}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm min-w-[140px]"
        >
          <option value="">Todas as espécies</option>
          <option value="Cão">Cão</option>
          <option value="Gato">Gato</option>
        </select>

        <select
          value={sexoFiltro}
          onChange={(e) => { setSexoFiltro(e.target.value); setPage(1); }}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm min-w-[130px]"
        >
          <option value="">Todos os sexos</option>
          <option value="M">Macho</option>
          <option value="F">Fêmea</option>
          <option value="Indefinido">Indefinido</option>
        </select>

        {/* Filtro por cliente */}
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={clienteSearch}
            onChange={(e) => {
              if (clienteSelecionado) limparCliente();
              buscarClientes(e.target.value);
            }}
            onBlur={() => setTimeout(() => setClienteDropdownOpen(false), 150)}
            placeholder="Filtrar por cliente..."
            className="pl-9 pr-8"
          />
          {clienteSelecionado && (
            <button
              type="button"
              onClick={limparCliente}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {clienteDropdownOpen && clienteOptions.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
              {clienteOptions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent transition-colors border-b border-border last:border-0"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selecionarCliente(c)}
                >
                  <p className="font-medium">{c.nome}</p>
                  <p className="text-xs text-muted-foreground">{c.cidade}{c.telefone ? ` · ${c.telefone}` : ""}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {clienteSelecionado && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent/50 rounded-lg px-3 py-1.5 self-start">
            <span>Exibindo animais de <strong className="text-foreground">{clienteSelecionado.nome}</strong></span>
            <button onClick={limparCliente} className="hover:text-foreground transition-colors ml-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
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
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Cliente</th>
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
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      message={clienteSelecionado
                        ? `Nenhum animal encontrado para ${clienteSelecionado.nome}`
                        : "Nenhum animal encontrado"}
                    />
                  </td>
                </tr>
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
                    <td className="px-4 py-3 text-muted-foreground">{a.cliente?.nome ?? "—"}</td>
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
        fixedClienteId={clienteSelecionado?.id}
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
