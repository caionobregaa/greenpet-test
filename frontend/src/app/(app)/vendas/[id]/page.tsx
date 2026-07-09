"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Pencil, CalendarDays, Timer, ChevronDown, ChevronUp, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useVenda, useDeleteVenda, useUpdateVenda } from "@/lib/hooks/use-vendas";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatDate, formatBRL } from "@/lib/utils/format";

interface Props {
  params: Promise<{ id: string }>;
}

interface RecompraEdit {
  consumoDiario: string;
  recompraData: string;
  expanded: boolean;
}

function toDateInput(val: string | null | undefined): string {
  if (!val) return "";
  return val.slice(0, 10);
}

export default function VendaDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [recompraEdits, setRecompraEdits] = useState<Record<string, RecompraEdit>>({});
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { data: venda, isLoading } = useVenda(id);
  const deleteVenda = useDeleteVenda();
  const updateVenda = useUpdateVenda();

  useEffect(() => {
    if (!venda || initialized) return;
    const edits: Record<string, RecompraEdit> = {};
    venda.itens.forEach((item) => {
      edits[item.id] = {
        consumoDiario: item.consumoDiario ? String(item.consumoDiario) : "",
        recompraData: toDateInput(item.recompraData),
        expanded: !!(item.consumoDiario || item.recompraData),
      };
    });
    setRecompraEdits(edits);
    setInitialized(true);
  }, [venda, initialized]);

  function toggleExpand(itemId: string) {
    setRecompraEdits((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], expanded: !prev[itemId]?.expanded },
    }));
  }

  function setField(itemId: string, field: "consumoDiario" | "recompraData", value: string) {
    setRecompraEdits((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  }

  const hasAnyRecompra = venda?.itens.some((item) => {
    const edit = recompraEdits[item.id];
    return !!(edit?.consumoDiario || edit?.recompraData);
  });

  async function handleSaveRecompra() {
    if (!venda) return;
    setSaving(true);
    try {
      const itens = venda.itens.map((item) => {
        const edit = recompraEdits[item.id];
        const cd = edit?.consumoDiario ? parseInt(edit.consumoDiario, 10) : undefined;
        return {
          produtoId: item.produtoId ?? undefined,
          nome: item.nome,
          qtd: item.qtd,
          valorUnitario: item.valorUnitario,
          desconto: item.desconto,
          itemAnimalId: item.itemAnimalId ?? undefined,
          consumoDiario: cd && cd >= 1 ? cd : undefined,
          recompraData: edit?.recompraData || undefined,
        };
      });
      await updateVenda.mutateAsync({ id, input: { itens } });
      toast.success("Recompra salva! O alerta aparecerá na aba de Recompra.");
    } catch {
      toast.error("Erro ao salvar recompra.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteVenda.mutateAsync(id);
      toast.success("Venda excluída!");
      router.push("/vendas");
    } catch {
      toast.error("Erro ao excluir venda.");
    }
  }

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!venda) return <p className="text-muted-foreground">Venda não encontrada.</p>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">
            {venda.numero ? `Venda V${String(venda.numero).padStart(5, "0")}` : `Venda #${id.slice(-6).toUpperCase()}`}
          </h1>
          <p className="text-sm text-muted-foreground">{formatDate(venda.data)}</p>
        </div>
        <Link href={`/vendas/${id}/editar`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          <Pencil className="w-3.5 h-3.5 mr-1.5" />
          Editar
        </Link>
        <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Excluir
        </Button>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          ["Cliente", venda.cliente?.nome ?? "—"],
          ["Animal", venda.animal?.nome ?? "—"],
          ["Forma de Pag.", venda.formaPag],
          ["Data", formatDate(venda.data)],
        ].map(([label, value]) => (
          <div key={label} className="bg-card rounded-xl border border-border p-4 shadow-sm">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
            <p className="text-sm font-medium">{value}</p>
          </div>
        ))}
      </div>

      {/* Items */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm mb-4">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">Itens da Venda</p>
          <p className="text-xs text-muted-foreground hidden sm:block">Clique em <CalendarDays className="inline w-3 h-3" /> para configurar recompra por item</p>
        </div>

        {/* Column headers */}
        <div className="hidden sm:grid grid-cols-[1fr_48px_120px_120px_36px] px-4 py-2 bg-muted/50 gap-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Produto / Serviço</span>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">Qtd</span>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Valor Unit.</span>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-right">Total</span>
          <span></span>
        </div>

        <div className="divide-y divide-border">
          {venda.itens.map((item) => {
            const edit = recompraEdits[item.id];
            const expanded = edit?.expanded ?? false;
            const hasRecompra = !!(item.consumoDiario || item.recompraData);

            return (
              <div key={item.id}>
                {/* Item row */}
                <div className="flex sm:grid sm:grid-cols-[1fr_48px_120px_120px_36px] items-center px-4 py-3 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.nome}</p>
                    <p className="text-xs text-muted-foreground sm:hidden">
                      {item.qtd}x · {formatBRL(item.valorUnitario)} = {formatBRL(item.total)}
                    </p>
                    {hasRecompra && !expanded && (
                      <p className="text-xs text-primary font-medium flex items-center gap-1 mt-0.5">
                        <CalendarDays className="w-3 h-3" />
                        {item.recompraData
                          ? toDateInput(item.recompraData).split("-").reverse().join("/")
                          : `${item.consumoDiario}g/dia`}
                      </p>
                    )}
                  </div>
                  <span className="hidden sm:block text-center text-muted-foreground text-sm">{item.qtd}</span>
                  <span className="hidden sm:block text-right font-mono text-muted-foreground text-sm">{formatBRL(item.valorUnitario)}</span>
                  <span className="hidden sm:block text-right font-mono font-semibold text-sm">{formatBRL(item.total)}</span>
                  <Button
                    type="button"
                    variant={expanded ? "secondary" : "ghost"}
                    size="sm"
                    className={`h-8 w-8 p-0 shrink-0 ${hasRecompra && !expanded ? "text-primary" : ""}`}
                    title="Configurar recompra"
                    onClick={() => toggleExpand(item.id)}
                  >
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
                  </Button>
                </div>

                {/* Recompra expand section */}
                {expanded && (
                  <div className="px-4 pb-4 pt-3 bg-muted/20 border-t border-border/30 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
                      Configurar Recompra — {item.nome}
                    </p>
                    <div className="flex flex-wrap gap-4 items-end">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground/70 flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          Consumo diário (g/dia)
                          <span className="font-normal normal-case tracking-normal">— opcional</span>
                        </p>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={edit?.consumoDiario ?? ""}
                          onChange={(e) => setField(item.id, "consumoDiario", e.target.value)}
                          placeholder="ex: 250"
                          className="w-32 h-8 text-sm"
                        />
                        <p className="text-[10px] text-muted-foreground/50">Para calcular a data automaticamente</p>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground/70 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          Data p/ recompra
                          <span className="font-normal normal-case tracking-normal">— opcional</span>
                        </p>
                        <Input
                          type="date"
                          value={edit?.recompraData ?? ""}
                          onChange={(e) => setField(item.id, "recompraData", e.target.value)}
                          className="w-40 h-8 text-sm"
                        />
                        <p className="text-[10px] text-muted-foreground/50">Data fixa de lembrete</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Totals */}
        <div className="border-t-2 border-border bg-accent/30 px-4 py-3 flex justify-end items-center gap-6">
          <span className="text-sm font-semibold text-muted-foreground">Total Bruto</span>
          <span className="font-bold text-primary font-mono text-lg">{formatBRL(venda.total)}</span>
        </div>
        {venda.taxaCartao > 0 && (
          <>
            <div className="border-t border-border/60 px-4 py-2 flex justify-end items-center gap-6">
              <span className="text-xs text-destructive">Taxa {venda.formaPag} ({venda.taxaCartao}%)</span>
              <span className="text-xs text-destructive font-mono">− {formatBRL(venda.total * venda.taxaCartao / 100)}</span>
            </div>
            <div className="border-t border-border bg-primary/5 px-4 py-2.5 flex justify-end items-center gap-6">
              <span className="text-sm font-semibold">Líquido estimado</span>
              <span className="font-bold text-primary font-mono">{formatBRL(venda.total * (1 - venda.taxaCartao / 100))}</span>
            </div>
          </>
        )}
      </div>

      {/* Save recompra */}
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleSaveRecompra}
          disabled={saving || !hasAnyRecompra}
          size="sm"
          variant={hasAnyRecompra ? "default" : "outline"}
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          {saving ? "Salvando..." : "Salvar Recompra"}
        </Button>
      </div>

      {venda.obs && (
        <div className="mt-2 bg-card rounded-xl border border-border p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Observações</p>
          <p className="text-sm">{venda.obs}</p>
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir venda?"
        description="Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        loading={deleteVenda.isPending}
      />
    </div>
  );
}
