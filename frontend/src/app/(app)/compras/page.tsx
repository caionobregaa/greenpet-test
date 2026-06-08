"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Eye, Trash2, Settings2, X, Tag, PackagePlus, PackageX } from "lucide-react";
import { useCompras, useDeleteCompra, useCreateCompra, useImportarEstoque } from "@/lib/hooks/use-compras";
import type { Compra } from "@/lib/types/compra";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateCompraSchema, FORMAS_PAG, type CreateCompraInput } from "@/lib/schemas/compra.schema";
import { ItensTable } from "@/components/vendas/itens-table";
import { formatDate, formatBRL, todayISO } from "@/lib/utils/format";
import { Loader2 } from "lucide-react";
import { CATEGORIAS_DESPESA_PADRAO } from "@/lib/types/compra";

// ── Categorias (localStorage persistence) ─────────────────────────────────────

const STORAGE_KEY = "greenpet:categorias_despesa";

function loadCategorias(): string[] {
  if (typeof window === "undefined") return CATEGORIAS_DESPESA_PADRAO;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : CATEGORIAS_DESPESA_PADRAO;
  } catch {
    return CATEGORIAS_DESPESA_PADRAO;
  }
}

function saveCategorias(cats: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
}

// ── Dialog: Gerenciar categorias ──────────────────────────────────────────────

function GerenciarCategoriasDialog({
  open,
  onOpenChange,
  categorias,
  onChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  categorias: string[];
  onChange: (cats: string[]) => void;
}) {
  const [nova, setNova] = useState("");

  function addCategoria() {
    const cat = nova.trim();
    if (!cat) return;
    if (categorias.includes(cat)) { toast.error("Categoria já existe."); return; }
    const updated = [...categorias, cat];
    onChange(updated);
    saveCategorias(updated);
    setNova("");
    toast.success("Categoria adicionada!");
  }

  function removeCategoria(cat: string) {
    if (CATEGORIAS_DESPESA_PADRAO.includes(cat)) {
      toast.error("Categorias padrão não podem ser excluídas.");
      return;
    }
    const updated = categorias.filter((c) => c !== cat);
    onChange(updated);
    saveCategorias(updated);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Gerenciar Categorias</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            {categorias.map((cat) => (
              <div key={cat} className="flex items-center justify-between bg-muted/30 rounded-md px-3 py-2">
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{cat}</span>
                  {CATEGORIAS_DESPESA_PADRAO.includes(cat) && (
                    <span className="text-[9px] uppercase tracking-wide text-muted-foreground bg-muted rounded px-1">padrão</span>
                  )}
                </div>
                {!CATEGORIAS_DESPESA_PADRAO.includes(cat) && (
                  <Button
                    variant="ghost" size="sm"
                    className="h-6 w-6 p-0 text-destructive/70 hover:text-destructive"
                    onClick={() => removeCategoria(cat)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2 border-t border-border">
            <Input
              value={nova}
              onChange={(e) => setNova(e.target.value)}
              placeholder="Nova categoria..."
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCategoria(); } }}
              className="flex-1"
            />
            <Button size="sm" onClick={addCategoria}>
              <Plus className="w-3.5 h-3.5 mr-1" />Adicionar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Dialog: Nova Despesa ───────────────────────────────────────────────────────

function NovaDespesaDialog({
  open,
  onOpenChange,
  categorias,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  categorias: string[];
  onCreated?: (compra: Compra) => void;
}) {
  const create = useCreateCompra();
  const [categoria, setCategoria] = useState("Produtos Pets");

  const isProdutos = categoria === "Produtos Pets";

  const { register, handleSubmit, control, setValue, formState: { errors }, reset, watch } = useForm<CreateCompraInput>({
    resolver: zodResolver(CreateCompraSchema),
    defaultValues: {
      fornecedor: "",
      dataPedido: todayISO(),
      categoria: "Produtos Pets",
      descricaoSimples: "",
      formaPag: undefined,
      totalManual: undefined,
      itens: [],
    },
  });

  const watchedItens = watch("itens");
  const totalItens = (watchedItens ?? []).reduce((s: number, i: { qtd?: number; valorUnitario?: number }) => s + (Number(i?.qtd ?? 0) * Number(i?.valorUnitario ?? 0)), 0);

  const onSubmit = useCallback(async (data: CreateCompraInput) => {
    if (isProdutos && (!data.itens || data.itens.length === 0)) {
      toast.error("Adicione pelo menos um produto.");
      return;
    }
    if (!isProdutos && (!data.totalManual || data.totalManual <= 0)) {
      toast.error("Informe o valor total da despesa.");
      return;
    }
    try {
      const payload = {
        ...data,
        fornecedor: data.fornecedor || categoria,
        dataPedido: data.dataPedido || undefined,
        obs: data.obs || undefined,
        descricaoSimples: data.descricaoSimples || undefined,
        categoria,
      };
      const compra = await create.mutateAsync(payload);
      reset({ fornecedor: "", dataPedido: todayISO(), categoria: "Produtos Pets", formaPag: undefined, itens: [] });
      setCategoria("Produtos Pets");
      onOpenChange(false);
      onCreated?.(compra);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error("Erro ao registrar despesa", { description: msg });
    }
  }, [create, reset, onOpenChange, isProdutos, categoria, onCreated]);

  function handleCategoriaChange(val: string | null) {
    if (!val) return;
    setCategoria(val);
    setValue("categoria", val);
    setValue("itens", []);
    setValue("totalManual", undefined);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[820px] sm:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Despesa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Categoria + Data + Forma de Pagamento */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <Select value={categoria} onValueChange={handleCategoriaChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dataPedido">Data</Label>
              <Input type="date" {...register("dataPedido")} />
            </div>
          </div>

          {/* Forma de pagamento */}
          <div className="space-y-1.5">
            <Label>Forma de Pagamento</Label>
            <Select onValueChange={(v) => setValue("formaPag", v as typeof FORMAS_PAG[number])}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {FORMAS_PAG.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campos específicos por categoria */}
          {isProdutos ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="fornecedor">Fornecedor *</Label>
                <Input {...register("fornecedor")} placeholder="Nome do fornecedor" />
                {errors.fornecedor && <p className="text-xs text-destructive">{errors.fornecedor.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="obs">Observações</Label>
                <Textarea {...register("obs")} rows={2} />
              </div>
              <ItensTable
                control={control as unknown as Parameters<typeof ItensTable>[0]["control"]}
                setValue={setValue as unknown as Parameters<typeof ItensTable>[0]["setValue"]}
                errors={errors.itens as Parameters<typeof ItensTable>[0]["errors"]}
                showPesoKg
              />
              {(errors.itens as { message?: string } | undefined)?.message && (
                <p className="text-xs text-destructive">{(errors.itens as { message?: string }).message}</p>
              )}
              {isProdutos && (
                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Total da despesa</p>
                    <p className="text-xl font-bold text-primary tabular-nums">{formatBRL(totalItens)}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="fornecedor">Fonte / Referência</Label>
                <Input {...register("fornecedor")} placeholder={`Ex: ${categoria}...`} />
              </div>
              <div className="space-y-1.5">
                <Label>Descrição do Gasto</Label>
                <Textarea
                  {...register("descricaoSimples")}
                  rows={3}
                  placeholder="Descreva o gasto em detalhes..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Valor Total (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("totalManual", { valueAsNumber: true })}
                  placeholder="0,00"
                />
                {errors.totalManual && <p className="text-xs text-destructive">{errors.totalManual.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="obs">Observações</Label>
                <Textarea {...register("obs")} rows={2} />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4 mt-1 border-t border-border/60">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground">Cancelar</Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</> : "Registrar Despesa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Dialog: Importar para o Estoque ───────────────────────────────────────────

function ImportarEstoqueDialog({
  compra,
  onClose,
}: {
  compra: Compra | null;
  onClose: () => void;
}) {
  const importar = useImportarEstoque();
  const itensComProduto = compra?.itens.filter((i) => i.produtoId) ?? [];
  const open = !!compra;

  async function handleImportar() {
    if (!compra) return;
    try {
      const result = await importar.mutateAsync(compra.id);
      toast.success(`${result.importados} ${result.importados === 1 ? "item importado" : "itens importados"} para o estoque!`);
    } catch {
      toast.error("Erro ao importar para o estoque.");
    } finally {
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-primary" />
            Importar para o Estoque?
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Deseja lançar automaticamente os produtos desta despesa no estoque físico da loja?
          </p>

          {itensComProduto.length > 0 ? (
            <div className="rounded-md border border-border/60 overflow-hidden">
              <div className="bg-muted/40 px-3 py-2 border-b border-border/60">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {itensComProduto.length} {itensComProduto.length === 1 ? "produto" : "produtos"} serão adicionados ao estoque
                </p>
              </div>
              <ul className="divide-y divide-border/40">
                {itensComProduto.map((item) => (
                  <li key={item.id} className="flex items-center justify-between px-3 py-2.5 text-sm">
                    <span className="font-medium">{item.nome}</span>
                    <span className="text-muted-foreground tabular-nums">
                      +{item.qtd} {item.qtd === 1 ? "unidade" : "unidades"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-md bg-muted/30 border border-border/50 px-4 py-3 text-sm text-muted-foreground">
              Nenhum item desta despesa está vinculado a um produto do catálogo. Nada será importado.
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="gap-1.5">
              <PackageX className="w-4 h-4" />
              Não, obrigado
            </Button>
            <Button onClick={handleImportar} disabled={importar.isPending || itensComProduto.length === 0} className="gap-1.5">
              {importar.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" />Importando...</>
                : <><PackagePlus className="w-4 h-4" />Sim, importar para o estoque</>
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function DespesasPage() {
  const [page, setPage] = useState(1);
  const [newOpen, setNewOpen] = useState(false);
  const [gerenciarOpen, setGerenciarOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importarCompra, setImportarCompra] = useState<Compra | null>(null);
  const [categorias, setCategorias] = useState<string[]>(loadCategorias);

  const { data, isLoading } = useCompras({ page, limit: 20 });
  const deleteCompra = useDeleteCompra();

  function handleCreated(compra: Compra) {
    toast.success("Despesa registrada com sucesso!");
    if (compra.categoria === "Produtos Pets" && compra.itens.some((i) => i.produtoId)) {
      setImportarCompra(compra);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try { await deleteCompra.mutateAsync(deleteId); toast.success("Despesa excluída!"); }
    catch { toast.error("Erro ao excluir despesa."); }
    finally { setDeleteId(null); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Despesas</h1>
          <p className="text-sm text-muted-foreground">Controle de despesas da empresa</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setGerenciarOpen(true)}>
            <Settings2 className="w-4 h-4 mr-2" />Categorias
          </Button>
          <Button onClick={() => setNewOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />Nova Despesa
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Data</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Categoria</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">Descrição / Fornecedor</th>
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
                <tr><td colSpan={6}><EmptyState message="Nenhuma despesa registrada" /></td></tr>
              ) : data?.data.map((c) => (
                <tr key={c.id} className="border-t border-border hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(c.dataPedido)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-accent px-2 py-0.5 rounded-full">
                      <Tag className="w-2.5 h-2.5" />{c.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                    {c.descricaoSimples
                      ? <span className="truncate max-w-[200px] block">{c.descricaoSimples}</span>
                      : <span className="font-medium text-foreground">{c.fornecedor}</span>
                    }
                  </td>
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

      <NovaDespesaDialog open={newOpen} onOpenChange={setNewOpen} categorias={categorias} onCreated={handleCreated} />
      <ImportarEstoqueDialog compra={importarCompra} onClose={() => setImportarCompra(null)} />
      <GerenciarCategoriasDialog
        open={gerenciarOpen}
        onOpenChange={setGerenciarOpen}
        categorias={categorias}
        onChange={setCategorias}
      />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => { if (!o) setDeleteId(null); }}
        title="Excluir despesa?"
        description="Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        loading={deleteCompra.isPending}
      />
    </div>
  );
}
