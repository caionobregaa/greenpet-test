"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Search, X, FileText, CreditCard, Banknote, QrCode, Wallet, ChevronDown } from "lucide-react";
import { CreateVendaSchema, type CreateVendaInput } from "@/lib/schemas/venda.schema";
import { useCreateVenda } from "@/lib/hooks/use-vendas";
import { useConverterOrcamento } from "@/lib/hooks/use-orcamentos";
import { apiClientes } from "@/lib/api/clientes";
import { apiAnimais } from "@/lib/api/animais";
import { apiOrcamentos } from "@/lib/api/orcamentos";
import type { Cliente } from "@/lib/types/cliente";
import type { Animal } from "@/lib/types/animal";
import type { Orcamento } from "@/lib/types/orcamento";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ItensTable } from "@/components/vendas/itens-table";
import { todayISO, formatBRL } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

// ── Payment options ──────────────────────────────────────────────────────────

const TAXAS = {
  "link-1x":        { label: "Link de Pagamento 1x",          pct: 4.20 },
  "link-2x":        { label: "Link de Pagamento 2x+",         pct: 6.09 },
  "maquininha-1x":  { label: "Infinite TAP 1x",               pct: 3.15 },
  "maquininha-2x":  { label: "Infinite TAP 2x+",              pct: 5.39 },
  "debito":         { label: "Cartão Débito",                  pct: 1.37 },
} as const;

type TaxaKey = keyof typeof TAXAS;
type FormaPagBackend = "Pix" | "Dinheiro" | "Cartão Crédito" | "Cartão Débito" | "Boleto";

interface OpcaoPag {
  value: string;
  label: string;
  backend: FormaPagBackend;
  taxaKey?: TaxaKey;
  Icon: React.ElementType;
}

const OPCOES_PAG: OpcaoPag[] = [
  { value: "pix",           label: "PIX",                                         backend: "Pix",           Icon: QrCode    },
  { value: "dinheiro",      label: "Dinheiro",                                    backend: "Dinheiro",      Icon: Banknote  },
  { value: "link-1x",       label: "Crédito — Link de Pagamento 1x (4,2%)",       backend: "Cartão Crédito", taxaKey: "link-1x",       Icon: CreditCard },
  { value: "link-2x",       label: "Crédito — Link de Pagamento 2x+ (6,09%)",     backend: "Cartão Crédito", taxaKey: "link-2x",       Icon: CreditCard },
  { value: "maquininha-1x", label: "Crédito — Infinite TAP 1x (3,15%)",           backend: "Cartão Crédito", taxaKey: "maquininha-1x", Icon: CreditCard },
  { value: "maquininha-2x", label: "Crédito — Infinite TAP 2x+ (5,39%)",          backend: "Cartão Crédito", taxaKey: "maquininha-2x", Icon: CreditCard },
  { value: "cartao-debito", label: "Débito (1,37%)",                               backend: "Cartão Débito",  taxaKey: "debito",        Icon: Wallet     },
];

// ── FormaPag selector ────────────────────────────────────────────────────────

function FormaPagDetalhada({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = OPCOES_PAG.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border text-sm transition-colors",
          "bg-background border-input hover:border-primary/50",
          !selected && "text-muted-foreground"
        )}
      >
        <span className="flex items-center gap-2">
          {selected ? (
            <>
              <selected.Icon className="w-4 h-4 text-muted-foreground" />
              {selected.label}
            </>
          ) : (
            "Selecione a forma de pagamento..."
          )}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-md overflow-hidden">
          {OPCOES_PAG.map((o) => (
            <button
              key={o.value}
              type="button"
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-accent transition-colors text-left border-b border-border/40 last:border-0",
                value === o.value && "bg-accent"
              )}
              onClick={() => { onValueChange(o.value); setOpen(false); }}
            >
              <o.Icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{o.label}</span>
              {o.taxaKey && (
                <span className="ml-auto text-xs text-destructive font-medium">−{TAXAS[o.taxaKey].pct}%</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Importar de Orçamento ────────────────────────────────────────────────────

function ImportarOrcamento({
  onSelect,
}: {
  onSelect: (o: Orcamento) => void;
}) {
  const [open, setOpen] = useState(false);
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await apiOrcamentos.list({ status: "pendente", limit: 50 });
      setOrcamentos(data.filter((o) => !!o.clienteId));
    } catch {
      toast.error("Erro ao carregar orçamentos.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpen() {
    if (!open) load();
    setOpen((p) => !p);
  }

  return (
    <div>
      <Button type="button" variant="outline" size="sm" onClick={handleOpen} className="gap-1.5">
        <FileText className="w-4 h-4" />
        Importar de Orçamento
      </Button>
      {open && (
        <div className="mt-3 border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />Carregando...
            </div>
          ) : orcamentos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum orçamento pendente com cliente vinculado.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nº</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Itens</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
                  <th className="px-4 py-2 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {orcamentos.map((o) => (
                  <tr key={o.id} className="border-t border-border hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{String(o.numero ?? 0).padStart(3, "0")}</td>
                    <td className="px-4 py-2 font-medium">{o.cliente?.nome ?? "—"}</td>
                    <td className="px-4 py-2 text-muted-foreground hidden sm:table-cell">{o.itens.length} item(s)</td>
                    <td className="px-4 py-2 text-right font-mono font-semibold text-primary">{formatBRL(o.total)}</td>
                    <td className="px-4 py-2 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => { onSelect(o); setOpen(false); }}
                      >
                        Usar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function NovaVendaPage() {
  const router = useRouter();
  const createVenda = useCreateVenda();
  const converterOrcamento = useConverterOrcamento();

  // Selected orcamento for converter flow
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState<Orcamento | null>(null);
  const [formaPagKey, setFormaPagKey] = useState("");

  const [clienteQ, setClienteQ] = useState("");
  const [clienteOptions, setClienteOptions] = useState<Cliente[]>([]);
  const [clienteOpen, setClienteOpen] = useState(false);
  const [clienteSelected, setClienteSelected] = useState<Cliente | null>(null);
  const clienteTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [animalQ, setAnimalQ] = useState("");
  const [animalOptions, setAnimalOptions] = useState<Animal[]>([]);
  const [animalOpen, setAnimalOpen] = useState(false);
  const [animalSelected, setAnimalSelected] = useState<Animal | null>(null);
  const animalTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<CreateVendaInput>({
    resolver: zodResolver(CreateVendaSchema),
    defaultValues: { data: todayISO(), itens: [], taxaCartao: 0, taxaEntrega: 0 },
  });

  // Delivery fee state
  const [cobrarEntrega, setCobrarEntrega] = useState(false);
  const [valorEntrega, setValorEntrega] = useState(0);

  // Compute total from itens for profit display
  const [formTotal, setFormTotal] = useState(0);

  const selectedOpcao = OPCOES_PAG.find((o) => o.value === formaPagKey);
  const taxaPct = selectedOpcao?.taxaKey ? TAXAS[selectedOpcao.taxaKey].pct : 0;
  const entrega = cobrarEntrega ? (valorEntrega || 0) : 0;
  const totalBruto = orcamentoSelecionado
    ? orcamentoSelecionado.total + entrega
    : formTotal + entrega;
  const lucroLiquido = totalBruto * (1 - taxaPct / 100);

  function searchClientes(q: string) {
    setClienteQ(q);
    clearTimeout(clienteTimer.current);
    if (!q.trim()) { setClienteOptions([]); setClienteOpen(false); return; }
    clienteTimer.current = setTimeout(async () => {
      try {
        const { data } = await apiClientes.list({ q, limit: 8 });
        setClienteOptions(data);
        setClienteOpen(data.length > 0);
      } catch {
        setClienteOptions([]);
      }
    }, 300);
  }

  async function selectCliente(c: Cliente, onChange: (v: string) => void) {
    setClienteSelected(c);
    setClienteQ(c.nome);
    setClienteOptions([]);
    setClienteOpen(false);
    onChange(c.id);
    setAnimalSelected(null);
    setAnimalQ("");
    setValue("animalId", null);
    try {
      const { data } = await apiAnimais.list({ clienteId: c.id, limit: 20 });
      if (data.length === 1) {
        setAnimalSelected(data[0]);
        setAnimalQ(data[0].nome);
        setValue("animalId", data[0].id);
      } else if (data.length > 1) {
        setAnimalOptions(data);
        setAnimalOpen(true);
      }
    } catch { /* ignore */ }
  }

  function clearCliente(onChange: (v: string) => void) {
    setClienteSelected(null);
    setClienteQ("");
    setClienteOptions([]);
    setClienteOpen(false);
    onChange("");
    setAnimalSelected(null);
    setAnimalQ("");
    setValue("animalId", null);
  }

  function searchAnimais(q: string) {
    setAnimalQ(q);
    clearTimeout(animalTimer.current);
    if (!q.trim() || !clienteSelected) { setAnimalOptions([]); setAnimalOpen(false); return; }
    animalTimer.current = setTimeout(async () => {
      try {
        const { data } = await apiAnimais.list({ clienteId: clienteSelected.id, q, limit: 8 });
        setAnimalOptions(data);
        setAnimalOpen(data.length > 0);
      } catch {
        setAnimalOptions([]);
      }
    }, 300);
  }

  function selectAnimal(a: Animal, onChange: (v: string | null) => void) {
    setAnimalSelected(a);
    setAnimalQ(a.nome);
    setAnimalOptions([]);
    setAnimalOpen(false);
    onChange(a.id);
  }

  function clearAnimal(onChange: (v: string | null) => void) {
    setAnimalSelected(null);
    setAnimalQ("");
    setAnimalOptions([]);
    setAnimalOpen(false);
    onChange(null);
  }

  // Import an orçamento: fill the form OR use converter flow
  function handleImportOrcamento(o: Orcamento) {
    setOrcamentoSelecionado(o);
    setFormaPagKey("");
    setFormTotal(o.total);
  }

  // Converter flow: bypass form validation
  async function handleConfirmarOrcamento() {
    const opcao = OPCOES_PAG.find((o) => o.value === formaPagKey);
    if (!opcao) { toast.error("Selecione a forma de pagamento."); return; }
    if (!orcamentoSelecionado) return;
    const taxaPctVal = opcao.taxaKey ? TAXAS[opcao.taxaKey].pct : 0;
    try {
      const result = await converterOrcamento.mutateAsync({
        id: orcamentoSelecionado.id,
        input: { formaPag: opcao.backend, taxaCartao: taxaPctVal, taxaEntrega: entrega },
      });
      toast.success("Venda registrada com sucesso!");
      router.push(`/vendas/${result.vendaId}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error("Erro ao registrar venda", { description: msg ?? "Tente novamente." });
    }
  }

  // Normal venda creation flow
  async function onSubmit(data: CreateVendaInput) {
    const opcao = OPCOES_PAG.find((o) => o.value === formaPagKey);
    if (!opcao) { toast.error("Selecione a forma de pagamento."); return; }
    const taxaPctVal = opcao.taxaKey ? TAXAS[opcao.taxaKey].pct : 0;
    try {
      const venda = await createVenda.mutateAsync({
        ...data,
        formaPag: opcao.backend,
        taxaCartao: taxaPctVal,
        taxaEntrega: entrega,
      });
      toast.success("Venda registrada com sucesso!");
      router.push(`/vendas/${venda.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error("Erro ao registrar venda", { description: msg ?? "Tente novamente." });
    }
  }

  const isPending = createVenda.isPending || converterOrcamento.isPending;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Nova Venda</h1>
          <p className="text-sm text-muted-foreground">Registrar nova venda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Import from orcamento */}
        <div className="bg-card rounded-lg border border-border/50 p-6 shadow-sm shadow-black/5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground mb-4">Importar Orçamento Pendente</h2>
          <ImportarOrcamento onSelect={handleImportOrcamento} />
          {orcamentoSelecionado && (
            <div className="mt-3 flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
              <FileText className="w-4 h-4 text-primary shrink-0" />
              <span>
                Orçamento <strong>#{String(orcamentoSelecionado.numero ?? 0).padStart(3, "0")}</strong>
                {" "}— {orcamentoSelecionado.cliente?.nome} — {formatBRL(orcamentoSelecionado.total)}
              </span>
              <button type="button" onClick={() => { setOrcamentoSelecionado(null); setFormaPagKey(""); }} className="ml-auto text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Payment method — always shown */}
        <div className="bg-card rounded-lg border border-border/50 p-6 shadow-sm shadow-black/5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground mb-4">Forma de Pagamento *</h2>
          <FormaPagDetalhada value={formaPagKey} onValueChange={(v) => {
            setFormaPagKey(v);
            const opcao = OPCOES_PAG.find((o) => o.value === v);
            if (opcao) setValue("formaPag", opcao.backend);
          }} />
          {errors.formaPag && <p className="text-xs text-destructive mt-1">{errors.formaPag.message}</p>}

          {/* Taxa de entrega */}
          <div className="mt-4 flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
              <input
                type="checkbox"
                checked={cobrarEntrega}
                onChange={(e) => { setCobrarEntrega(e.target.checked); if (!e.target.checked) setValorEntrega(0); }}
                className="w-4 h-4 rounded border-input accent-primary"
              />
              Cobrar taxa de entrega?
            </label>
            {cobrarEntrega && (
              <Input
                type="number"
                min="0"
                step="0.01"
                value={valorEntrega || ""}
                onChange={(e) => setValorEntrega(Number(e.target.value) || 0)}
                placeholder="R$ 0,00"
                className="w-32 h-8 text-sm"
              />
            )}
          </div>

          {formaPagKey && (
            <div className="mt-3 rounded-lg border border-border bg-accent/30 p-3 flex flex-wrap gap-4 text-sm">
              <span className="text-muted-foreground">Itens:</span>
              <span className="font-mono font-semibold">
                {formatBRL(orcamentoSelecionado ? orcamentoSelecionado.total : formTotal)}
              </span>
              {entrega > 0 && (
                <>
                  <span className="text-muted-foreground">+ entrega:</span>
                  <span className="font-mono font-semibold">{formatBRL(entrega)}</span>
                </>
              )}
              <span className="text-muted-foreground">= Total:</span>
              <span className="font-mono font-semibold">{formatBRL(totalBruto)}</span>
              {taxaPct > 0 && (
                <>
                  <span className="text-destructive">−{taxaPct}% taxa</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-mono font-bold text-primary">Líquido: {formatBRL(lucroLiquido)}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Only show these fields for direct (non-imported) vendas */}
        {!orcamentoSelecionado && (
          <>
            <div className="bg-card rounded-lg border border-border/50 p-8 shadow-sm shadow-black/5">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground mb-5">Dados da Venda</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">

                <div className="space-y-1.5">
                  <Label htmlFor="data">Data *</Label>
                  <Input id="data" type="date" {...register("data")} />
                </div>

                <div className="space-y-1.5">
                  <Label>Cliente *</Label>
                  <Controller
                    control={control}
                    name="clienteId"
                    render={({ field }) => (
                      <div className="relative">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                          <Input
                            value={clienteQ}
                            onChange={(e) => {
                              if (clienteSelected) { setClienteSelected(null); field.onChange(""); }
                              searchClientes(e.target.value);
                            }}
                            onBlur={() => setTimeout(() => setClienteOpen(false), 150)}
                            placeholder="Buscar cliente pelo nome..."
                            className="pl-9 pr-8"
                          />
                          {clienteSelected && (
                            <button type="button" onClick={() => clearCliente(field.onChange)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {clienteOpen && clienteOptions.length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border/60 rounded-md shadow-md overflow-hidden">
                            {clienteOptions.map((c) => (
                              <button key={c.id} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors border-b border-border/40 last:border-0" onMouseDown={(e) => e.preventDefault()} onClick={() => selectCliente(c, field.onChange)}>
                                <p className="font-medium text-[13px]">{c.nome}</p>
                                <p className="text-[11px] text-muted-foreground">{c.cidade}{c.telefone ? ` · ${c.telefone}` : ""}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  />
                  {errors.clienteId && <p className="text-xs text-destructive">{errors.clienteId.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label>Animal</Label>
                  <Controller
                    control={control}
                    name="animalId"
                    render={({ field }) => (
                      <div className="relative">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                          <Input
                            value={animalQ}
                            onChange={(e) => {
                              if (animalSelected) { setAnimalSelected(null); field.onChange(null); }
                              searchAnimais(e.target.value);
                            }}
                            onBlur={() => setTimeout(() => setAnimalOpen(false), 150)}
                            placeholder={clienteSelected ? "Buscar animal pelo nome..." : "Selecione um cliente primeiro"}
                            disabled={!clienteSelected}
                            className="pl-9 pr-8"
                          />
                          {animalSelected && (
                            <button type="button" onClick={() => clearAnimal(field.onChange)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {animalOpen && animalOptions.length > 0 && (
                          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                            {animalOptions.map((a) => (
                              <button key={a.id} type="button" className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent transition-colors border-b border-border last:border-0" onMouseDown={(e) => e.preventDefault()} onClick={() => selectAnimal(a, field.onChange)}>
                                <p className="font-medium">{a.nome}</p>
                                <p className="text-xs text-muted-foreground">{a.especie}{a.raca ? ` · ${a.raca}` : ""}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="obs">Observações</Label>
                  <Textarea id="obs" {...register("obs")} rows={2} placeholder="Observações sobre a venda..." />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border/50 p-8 shadow-sm shadow-black/5">
              <ItensTable
                control={control as unknown as Parameters<typeof ItensTable>[0]["control"]}
                setValue={setValue as unknown as Parameters<typeof ItensTable>[0]["setValue"]}
                errors={errors.itens as Parameters<typeof ItensTable>[0]["errors"]}
              />
              {errors.itens && typeof errors.itens.message === "string" && (
                <p className="text-xs text-destructive mt-2">{errors.itens.message}</p>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end gap-2 pb-8">
          <Button type="button" variant="ghost" onClick={() => router.back()} className="text-muted-foreground">
            Cancelar
          </Button>
          {orcamentoSelecionado ? (
            <Button type="button" onClick={handleConfirmarOrcamento} disabled={isPending}>
              {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Registrando...</> : "Confirmar Venda"}
            </Button>
          ) : (
            <Button type="submit" disabled={isPending}>
              {isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Registrando...</> : "Registrar Venda"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
