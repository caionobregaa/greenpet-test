"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Pencil, Package, AlertTriangle, Calendar } from "lucide-react";
import { useEstoque, useCreateEstoqueItem, useUpdateEstoqueItem, useDeleteEstoqueItem } from "@/lib/hooks/use-estoque";
import { useProdutos } from "@/lib/hooks/use-produtos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SearchInput } from "@/components/shared/search-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatBRL, formatDate } from "@/lib/utils/format";
import { Loader2 } from "lucide-react";
import type { EstoqueItem } from "@/lib/types/estoque";
import { differenceInDays, parseISO, isValid } from "date-fns";

// ── Helpers ───────────────────────────────────────────────────────────────────

function validadeStatus(validade: string | null): { label: string; color: string } {
  if (!validade) return { label: "Sem validade", color: "text-muted-foreground" };
  const d = parseISO(validade);
  if (!isValid(d)) return { label: "Sem validade", color: "text-muted-foreground" };
  const dias = differenceInDays(d, new Date());
  if (dias < 0) return { label: `Vencido há ${Math.abs(dias)} dias`, color: "text-destructive" };
  if (dias === 0) return { label: "Vence hoje!", color: "text-destructive" };
  if (dias <= 30) return { label: `Vence em ${dias} dia${dias !== 1 ? "s" : ""}`, color: "text-amber-600" };
  return { label: formatDate(validade), color: "text-muted-foreground" };
}

// ── Dialog: Adicionar lote ────────────────────────────────────────────────────

function AdicionarLoteDialog({
  open,
  onOpenChange,
  produtoIdInicial,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  produtoIdInicial?: string;
}) {
  const create = useCreateEstoqueItem();
  const { data: produtosData } = useProdutos({ limit: 200 });

  const [produtoId, setProdutoId] = useState(produtoIdInicial ?? "");
  const [quantidade, setQuantidade] = useState("1");
  const [validade, setValidade] = useState("");
  const [lote, setLote] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!produtoId) { toast.error("Selecione um produto."); return; }
    const qtd = parseInt(quantidade);
    if (!qtd || qtd < 1) { toast.error("Informe uma quantidade válida."); return; }
    try {
      await create.mutateAsync({
        produtoId,
        quantidade: qtd,
        validade: validade || null,
        lote: lote || undefined,
      });
      toast.success("Lote adicionado ao estoque!");
      setProdutoId(produtoIdInicial ?? "");
      setQuantidade("1");
      setValidade("");
      setLote("");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao adicionar lote.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar ao Estoque</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Produto *</Label>
            <Select value={produtoId} onValueChange={(v) => { if (v) setProdutoId(v); }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto..." />
              </SelectTrigger>
              <SelectContent>
                {produtosData?.data.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Quantidade *</Label>
              <Input
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="1"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Validade</Label>
              <Input
                type="date"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Lote / Referência</Label>
            <Input
              value={lote}
              onChange={(e) => setLote(e.target.value)}
              placeholder="Ex: L2024-001 (opcional)"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</> : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Dialog: Editar lote ───────────────────────────────────────────────────────

function EditarLoteDialog({
  item,
  open,
  onOpenChange,
}: {
  item: EstoqueItem | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const update = useUpdateEstoqueItem();

  const [quantidade, setQuantidade] = useState(item?.quantidade.toString() ?? "1");
  const [validade, setValidade] = useState(item?.validade?.slice(0, 10) ?? "");
  const [lote, setLote] = useState(item?.lote ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item) return;
    const qtd = parseInt(quantidade);
    if (!qtd || qtd < 1) { toast.error("Informe uma quantidade válida."); return; }
    try {
      await update.mutateAsync({
        id: item.id,
        input: { quantidade: qtd, validade: validade || null, lote: lote || undefined },
      });
      toast.success("Lote atualizado!");
      onOpenChange(false);
    } catch {
      toast.error("Erro ao atualizar lote.");
    }
  }

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Lote — {item.produto.nome}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Quantidade *</Label>
              <Input
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Validade</Label>
              <Input
                type="date"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Lote / Referência</Label>
            <Input
              value={lote}
              onChange={(e) => setLote(e.target.value)}
              placeholder="Ex: L2024-001 (opcional)"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</> : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function EstoquePage() {
  const [search, setSearch] = useState("");
  const [novoOpen, setNovoOpen] = useState(false);
  const [editItem, setEditItem] = useState<EstoqueItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addParaProduto, setAddParaProduto] = useState<string | undefined>();

  const { data, isLoading } = useEstoque({ limit: 200 });
  const deleteItem = useDeleteEstoqueItem();

  // Group items by product
  const grouped = useMemo(() => {
    if (!data?.data) return [];
    const filtered = search
      ? data.data.filter((i) =>
          i.produto.nome.toLowerCase().includes(search.toLowerCase()) ||
          (i.produto.marca ?? "").toLowerCase().includes(search.toLowerCase())
        )
      : data.data;

    const map = new Map<string, { produto: EstoqueItem["produto"]; lotes: EstoqueItem[] }>();
    for (const item of filtered) {
      const existing = map.get(item.produtoId);
      if (existing) {
        existing.lotes.push(item);
      } else {
        map.set(item.produtoId, { produto: item.produto, lotes: [item] });
      }
    }
    return Array.from(map.values());
  }, [data, search]);

  const totalItens = data?.data.reduce((s, i) => s + i.quantidade, 0) ?? 0;

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteItem.mutateAsync(deleteId);
      toast.success("Lote removido do estoque.");
    } catch {
      toast.error("Erro ao remover lote.");
    } finally {
      setDeleteId(null);
    }
  }

  function handleAddParaProduto(produtoId: string) {
    setAddParaProduto(produtoId);
    setNovoOpen(true);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Estoque</h1>
          <p className="text-sm text-muted-foreground">
            {totalItens} unidade{totalItens !== 1 ? "s" : ""} em estoque
          </p>
        </div>
        <Button onClick={() => { setAddParaProduto(undefined); setNovoOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar ao Estoque
        </Button>
      </div>

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar produto no estoque..."
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4">
              <Skeleton className="h-6 w-48 mb-3" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">Nenhum item no estoque</p>
          <p className="text-sm text-muted-foreground mt-1">
            Adicione produtos ao estoque usando o botão acima ou registre uma Despesa de Produtos Pets.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(({ produto, lotes }) => {
            const totalQtd = lotes.reduce((s, l) => s + l.quantidade, 0);
            const temVencimento = lotes.some((l) => {
              if (!l.validade) return false;
              const d = parseISO(l.validade);
              return isValid(d) && differenceInDays(d, new Date()) <= 30;
            });

            return (
              <div key={produto.id} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                {/* Cabeçalho do produto */}
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {produto.imagemUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={produto.imagemUrl}
                        alt={produto.nome}
                        className="w-12 h-12 rounded-lg object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center text-xl shrink-0">
                        📦
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{produto.nome}</p>
                        {temVencimento && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {produto.categoria}{produto.marca ? ` · ${produto.marca}` : ""} · {formatBRL(Number(produto.valorVenda))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Total em estoque</p>
                      <p className="text-lg font-bold text-primary">{totalQtd} un.</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleAddParaProduto(produto.id)}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar lote
                    </Button>
                  </div>
                </div>

                {/* Lotes */}
                <div className="divide-y divide-border">
                  {lotes.map((lote) => {
                    const vs = validadeStatus(lote.validade);
                    return (
                      <div key={lote.id} className="px-5 py-3 flex items-center justify-between hover:bg-accent/20 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                            <span className="text-base font-bold text-foreground">{lote.quantidade}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span className={`text-sm font-medium ${vs.color}`}>{vs.label}</span>
                            </div>
                            {lote.lote && (
                              <p className="text-xs text-muted-foreground mt-0.5">Lote: {lote.lote}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost" size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setEditItem(lote)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => setDeleteId(lote.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AdicionarLoteDialog
        key={addParaProduto ?? "novo"}
        open={novoOpen}
        onOpenChange={(o) => { setNovoOpen(o); if (!o) setAddParaProduto(undefined); }}
        produtoIdInicial={addParaProduto}
      />
      <EditarLoteDialog
        key={editItem?.id ?? "edit"}
        item={editItem}
        open={!!editItem}
        onOpenChange={(o) => { if (!o) setEditItem(null); }}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        title="Remover lote?"
        description="Este lote será removido do estoque. Ação não pode ser desfeita."
        onConfirm={handleDelete}
        loading={deleteItem.isPending}
      />
    </div>
  );
}
