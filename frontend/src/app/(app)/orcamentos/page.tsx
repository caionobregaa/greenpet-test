"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Eye, Trash2, Pencil, CreditCard, Banknote, QrCode, Wallet, Loader2, Share2, Check, UserPlus, X as XIcon } from "lucide-react";
import { useOrcamentos, useDeleteOrcamento, useCreateOrcamento, useUpdateOrcamento } from "@/lib/hooks/use-orcamentos";
import { useClientes, useCreateCliente } from "@/lib/hooks/use-clientes";
import { useAnimais } from "@/lib/hooks/use-animais";
import { apiClientes } from "@/lib/api/clientes";
import { apiAnimais } from "@/lib/api/animais";
import { apiProdutos } from "@/lib/api/produtos";
import { compartilharOrcamentoPDF } from "@/lib/utils/orcamento-pdf";
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
import {
  CreateOrcamentoSchema, type CreateOrcamentoInput,
  UpdateOrcamentoSchema, type UpdateOrcamentoInput,
} from "@/lib/schemas/orcamento.schema";
import { ItensTable } from "@/components/vendas/itens-table";
import { formatDate, formatBRL, todayISO, todayPlusDaysISO, formatTelefone } from "@/lib/utils/format";
import type { Orcamento } from "@/lib/types/orcamento";

// ── Payment method toggle ────────────────────────────────────────────────────

const FORMAS_ICONS = [
  { key: "Cartão Crédito", label: "Crédito",  Icon: CreditCard },
  { key: "Cartão Débito",  label: "Débito",   Icon: Wallet },
  { key: "PIX",            label: "PIX",      Icon: QrCode },
  { key: "Dinheiro",       label: "Dinheiro", Icon: Banknote },
];

function FormasPagSelector({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  function toggle(key: string) {
    onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);
  }
  return (
    <div className="flex gap-2 flex-wrap">
      {FORMAS_ICONS.map(({ key, label, Icon }) => {
        const active = value.includes(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
              active
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Dialog: Novo Orçamento ───────────────────────────────────────────────────


function NovoOrcamentoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const create = useCreateOrcamento();
  const createCliente = useCreateCliente();
  const [clienteId, setClienteId] = useState("");
  const { data: clientesData } = useClientes({ limit: 100 });
  const { data: animaisData } = useAnimais({ clienteId: clienteId || undefined, limit: 50 });

  // Quick client registration
  const [showQuickCliente, setShowQuickCliente] = useState(false);
  const [quickNome, setQuickNome] = useState("");
  const [quickTelefone, setQuickTelefone] = useState("");

  const { register, handleSubmit, control, setValue, watch: watchNovo, formState: { errors }, reset } = useForm<CreateOrcamentoInput>({
    resolver: zodResolver(CreateOrcamentoSchema),
    defaultValues: { data: todayISO(), validade: todayPlusDaysISO(7), itens: [], formasPag: [] },
  });

  const formasPagWatch = watchNovo("formasPag") ?? [];

  async function handleQuickCliente() {
    const nome = quickNome.trim();
    const tel = quickTelefone.replace(/\D/g, "");
    if (nome.length < 2 || tel.length !== 11) {
      toast.error("Informe nome (mín. 2 letras) e telefone com 11 dígitos.");
      return;
    }
    try {
      const novo = await createCliente.mutateAsync({ nome, telefone: quickTelefone, cidade: "Manaus" });
      setValue("clienteId", novo.id);
      setClienteId(novo.id);
      setValue("animalId", null);
      setShowQuickCliente(false);
      setQuickNome("");
      setQuickTelefone("");
      toast.success(`Cliente "${nome}" adicionado e selecionado!`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error("Erro ao criar cliente", { description: msg });
    }
  }

  async function onSubmit(data: CreateOrcamentoInput) {
    try {
      const payload = {
        ...data,
        clienteId: data.clienteId || undefined,
        animalId: data.animalId || undefined,
        obs: data.obs || undefined,
      };
      await create.mutateAsync(payload);
      toast.success("Orçamento criado com sucesso!");
      reset({ data: todayISO(), validade: todayPlusDaysISO(7), itens: [], formasPag: [] });
      setClienteId("");
      setShowQuickCliente(false);
      setQuickNome("");
      setQuickTelefone("");
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error("Erro ao criar orçamento", { description: msg });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90svh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle>Novo Orçamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Cliente <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                {showQuickCliente ? (
                  <div className="flex flex-col gap-2 p-3 bg-muted/40 rounded-lg border border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                        <UserPlus className="w-3 h-3" />
                        Novo Cliente Rápido
                      </span>
                      <button
                        type="button"
                        onClick={() => { setShowQuickCliente(false); setQuickNome(""); setQuickTelefone(""); }}
                        className="text-muted-foreground/50 hover:text-muted-foreground"
                      >
                        <XIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <Input
                      autoFocus
                      placeholder="Nome completo *"
                      value={quickNome}
                      onChange={(e) => setQuickNome(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleQuickCliente(); } }}
                      className="h-8 text-sm"
                    />
                    <Input
                      placeholder="WhatsApp: (XX) XXXXX-XXXX *"
                      value={quickTelefone}
                      onChange={(e) => setQuickTelefone(formatTelefone(e.target.value))}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleQuickCliente(); } }}
                      className="h-8 text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button" size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={handleQuickCliente}
                        disabled={createCliente.isPending || quickNome.trim().length < 2 || quickTelefone.replace(/\D/g, "").length !== 11}
                      >
                        {createCliente.isPending
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <Check className="w-3 h-3" />}
                        Salvar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Controller control={control} name="clienteId" render={({ field }) => {
                      const nomeCliente = clientesData?.data.find(c => c.id === field.value)?.nome;
                      return (
                        <Select value={field.value ?? ""} onValueChange={(v) => { field.onChange(v ?? ""); setClienteId(v ?? ""); setValue("animalId", null); }}>
                          <SelectTrigger className="flex-1">
                            {nomeCliente
                              ? <span className="flex flex-1 text-left text-sm truncate">{nomeCliente}</span>
                              : <SelectValue placeholder="Sem cliente" />}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Sem cliente</SelectItem>
                            {clientesData?.data.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      );
                    }} />
                    <Button
                      type="button" size="sm" variant="outline"
                      className="h-9 w-9 p-0 shrink-0 text-primary border-primary/40 hover:bg-primary/10"
                      title="Cadastrar novo cliente rapidamente"
                      onClick={() => setShowQuickCliente(true)}
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Animal <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                <Controller control={control} name="animalId" render={({ field }) => {
                  const nomeAnimal = animaisData?.data.find(a => a.id === field.value)?.nome;
                  return (
                    <Select value={field.value ?? ""} onValueChange={(v) => field.onChange(v || null)} disabled={!clienteId}>
                      <SelectTrigger>
                        {nomeAnimal
                          ? <span className="flex flex-1 text-left text-sm truncate">{nomeAnimal}</span>
                          : <SelectValue placeholder="Nenhum" />}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Nenhum</SelectItem>
                        {animaisData?.data.map((a) => <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  );
                }} />
              </div>
              <div className="space-y-1.5">
                <Label>Data</Label>
                <Input type="date" {...register("data")} />
              </div>
              <div className="space-y-1.5">
                <Label>Validade <span className="text-xs text-muted-foreground">(padrão: 7 dias)</span></Label>
                <Input type="date" {...register("validade")} />
                {errors.validade && <p className="text-xs text-destructive">{errors.validade.message}</p>}
              </div>
              <div className="space-y-1.5 col-span-1 sm:col-span-2">
                <Label>Observações</Label>
                <Textarea {...register("obs")} rows={2} placeholder="Observações opcionais..." />
              </div>
              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label>Formas de pagamento aceitas <span className="text-muted-foreground font-normal text-xs">(opcional — aparece no PDF)</span></Label>
                <FormasPagSelector value={formasPagWatch} onChange={(v) => setValue("formasPag", v)} />
              </div>
            </div>
            <ItensTable
              control={control as unknown as Parameters<typeof ItensTable>[0]["control"]}
              setValue={setValue as unknown as Parameters<typeof ItensTable>[0]["setValue"]}
              errors={errors.itens as Parameters<typeof ItensTable>[0]["errors"]}
            />
            {(errors.itens as { message?: string } | undefined)?.message && (
              <p className="text-xs text-destructive">{(errors.itens as { message?: string }).message}</p>
            )}
          </div>
          {/* Sticky footer */}
          <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-border bg-card">
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

// ── Dialog: Editar Orçamento ─────────────────────────────────────────────────

function EditarOrcamentoDialog({
  orcamento,
  open,
  onOpenChange,
}: {
  orcamento: Orcamento | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const update = useUpdateOrcamento();

  const { register, handleSubmit, control, setValue, formState: { errors }, reset } = useForm<UpdateOrcamentoInput>({
    resolver: zodResolver(UpdateOrcamentoSchema),
    values: orcamento
      ? {
          validade: orcamento.validade?.slice(0, 10) ?? "",
          obs: orcamento.obs ?? "",
          itens: orcamento.itens.map((i) => ({
            produtoId: i.produtoId ?? null,
            nome: i.nome,
            qtd: i.qtd,
            valorUnitario: i.valorUnitario,
            desconto: i.desconto ?? 0,
          })),
        }
      : undefined,
  });

  async function onSubmit(data: UpdateOrcamentoInput) {
    if (!orcamento) return;
    try {
      await update.mutateAsync({ id: orcamento.id, input: data });
      toast.success("Orçamento atualizado!");
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error("Erro ao atualizar orçamento", { description: msg ?? "Tente novamente." });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-3xl max-h-[90svh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle>Editar Orçamento #{orcamento?.id.slice(-6).toUpperCase()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Validade</Label>
                <Input type="date" {...register("validade")} />
                {errors.validade && <p className="text-xs text-destructive">{errors.validade.message}</p>}
              </div>
              <div className="space-y-1.5 col-span-1 sm:col-span-2">
                <Label>Observações</Label>
                <Textarea {...register("obs")} rows={2} placeholder="Observações opcionais..." />
              </div>
            </div>
            <ItensTable
              control={control as unknown as Parameters<typeof ItensTable>[0]["control"]}
              setValue={setValue as unknown as Parameters<typeof ItensTable>[0]["setValue"]}
              errors={errors.itens as Parameters<typeof ItensTable>[0]["errors"]}
            />
            {(errors.itens as { message?: string } | undefined)?.message && (
              <p className="text-xs text-destructive">{(errors.itens as { message?: string }).message}</p>
            )}
          </div>
          {/* Sticky footer */}
          <div className="shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-border bg-card">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</> : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function OrcamentosPage() {
  const [page, setPage] = useState(1);
  const [newOpen, setNewOpen] = useState(false);
  const [editOrcamento, setEditOrcamento] = useState<Orcamento | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const { data, isLoading } = useOrcamentos({ page, limit: 20 });
  const orcamentosVisiveis = useMemo(
    () => (data?.data ?? []).filter((o) => !o.vendaId),
    [data?.data]
  );
  // Approximation: subtracts only the hidden items on the current page from the
  // global total. Accurate for page 1; may overcount when converted items span
  // multiple pages. Real fix requires a server-side vendaId=null filter.
  const adjustedMeta = useMemo(() => {
    if (!data?.meta) return undefined;
    const hiddenOnPage = (data.data?.length ?? 0) - orcamentosVisiveis.length;
    return { ...data.meta, total: Math.max(0, data.meta.total - hiddenOnPage) };
  }, [data, orcamentosVisiveis]);
  const deleteOrcamento = useDeleteOrcamento();

  async function handleWhatsApp(o: Orcamento) {
    setSharingId(o.id);
    try {
      const produtoIds = [...new Set(o.itens.filter((i) => i.produtoId).map((i) => i.produtoId!))];
      const [cliente, animal, ...produtos] = await Promise.all([
        o.clienteId ? apiClientes.get(o.clienteId) : Promise.resolve(null),
        o.animalId ? apiAnimais.get(o.animalId) : Promise.resolve(null),
        ...produtoIds.map((pid) => apiProdutos.get(pid).catch(() => null)),
      ]);
      const produtoImages: Record<string, string> = {};
      produtos.forEach((p) => { if (p && p.imagemUrl?.startsWith("data:image")) produtoImages[p.id] = p.imagemUrl; });
      await compartilharOrcamentoPDF(o, cliente, animal, produtoImages);
    } catch (err: unknown) {
      if ((err as Error)?.name !== "AbortError") toast.error("Erro ao compartilhar orçamento.");
    } finally {
      setSharingId(null);
    }
  }

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

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {/* ── Mobile card list ──────────────────────────────────────────────── */}
        <div className="md:hidden divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <div className="flex gap-2 justify-end mt-1">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            ))
          ) : orcamentosVisiveis.length === 0 ? (
            <EmptyState message="Nenhum orçamento encontrado" />
          ) : (
            orcamentosVisiveis.map((o) => (
              <div key={o.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {o.cliente?.nome ?? <span className="text-muted-foreground italic">Sem cliente</span>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {o.numero ? `Nº ${String(o.numero).padStart(3, "0")} · ` : ""}{formatDate(o.data)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-primary font-mono text-sm">{formatBRL(o.total)}</p>
                    <div className="mt-1">
                      <StatusPill status={o.status} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 justify-end flex-wrap">
                  {o.status === "pendente" && (
                    <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => setEditOrcamento(o)}>
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </Button>
                  )}
                  <Button
                    variant="outline" size="sm"
                    className="h-8 gap-1.5 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/10"
                    onClick={() => handleWhatsApp(o)}
                    disabled={sharingId === o.id}
                  >
                    {sharingId === o.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Share2 className="w-3.5 h-3.5" />}
                    WhatsApp
                  </Button>
                  <Link href={`/orcamentos/${o.id}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 gap-1.5")}>
                    <Eye className="w-3.5 h-3.5" />
                    Ver
                  </Link>
                  <Button
                    variant="ghost" size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => setDeleteId(o.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Desktop table ─────────────────────────────────────────────────── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Nº</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Data</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Cliente</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Validade</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Total</th>
                <th className="px-4 py-3 w-28"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-border">
                  {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}
                </tr>
              )) : orcamentosVisiveis.length === 0 ? (
                <tr><td colSpan={7}><EmptyState message="Nenhum orçamento encontrado" /></td></tr>
              ) : orcamentosVisiveis.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.numero ? String(o.numero).padStart(3, "0") : "—"}</td>
                  <td className="px-4 py-3">{formatDate(o.data)}</td>
                  <td className="px-4 py-3 font-medium">{o.cliente?.nome ?? <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(o.validade)}</td>
                  <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                  <td className="px-4 py-3 text-right font-bold text-primary font-mono">{formatBRL(o.total)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      {o.status === "pendente" && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setEditOrcamento(o)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost" size="sm"
                        className="h-8 w-8 p-0 text-[#25D366] hover:text-[#25D366] hover:bg-[#25D366]/10"
                        onClick={() => handleWhatsApp(o)}
                        disabled={sharingId === o.id}
                        title="Compartilhar no WhatsApp"
                      >
                        {sharingId === o.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
                      </Button>
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

        {adjustedMeta && <div className="px-4 pb-4"><PaginationBar meta={adjustedMeta} onPageChange={setPage} /></div>}
      </div>

      <NovoOrcamentoDialog open={newOpen} onOpenChange={setNewOpen} />
      <EditarOrcamentoDialog
        orcamento={editOrcamento}
        open={!!editOrcamento}
        onOpenChange={(o) => { if (!o) setEditOrcamento(null); }}
      />
      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }} title="Excluir orçamento?" description="Esta ação não pode ser desfeita." onConfirm={handleDelete} loading={deleteOrcamento.isPending} />
    </div>
  );
}
