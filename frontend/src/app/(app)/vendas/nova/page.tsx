"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Search, X, FileText, ChevronDown, PawPrint, UserPlus, Check } from "lucide-react";
import { CreateVendaSchema, type CreateVendaInput } from "@/lib/schemas/venda.schema";
import { useCreateVenda } from "@/lib/hooks/use-vendas";
import { useConverterOrcamento } from "@/lib/hooks/use-orcamentos";
import { useCreateCliente } from "@/lib/hooks/use-clientes";
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
import { todayISO, todayLocalISO, formatBRL, formatDate, formatTelefone } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { OPCOES_PAGAMENTO } from "@/lib/utils/formas-pagamento";
import { FormaPagSelect } from "@/components/vendas/forma-pag-select";

// ── Payment options ──────────────────────────────────────────────────────────

// Regra oficial de precificação (ago/2026): desconto de recompra é sempre 5%
// sobre o subtotal dos itens, independente da forma de pagamento.
const DESCONTO_RECOMPRA_PCT = 0.05;

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
      const { data } = await apiOrcamentos.list({ status: "aberto", limit: 50 });
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
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum orçamento aberto com cliente vinculado.</p>
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
  const createCliente = useCreateCliente();

  // Selected orcamento for converter flow
  const [orcamentoSelecionado, setOrcamentoSelecionado] = useState<Orcamento | null>(null);
  const [dataPagamento, setDataPagamento] = useState(todayLocalISO);
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

  // Recompra discount — 5% sobre o subtotal quando o cliente já comprou antes
  const [clienteRecompra, setClienteRecompra] = useState(false);

  // Quick client registration
  const [showQuickCliente, setShowQuickCliente] = useState(false);
  const [quickNome, setQuickNome] = useState("");
  const [quickTelefone, setQuickTelefone] = useState("");

  // New animal inline state
  const [showNovoAnimal, setShowNovoAnimal] = useState(false);
  const [novoAnimalNome, setNovoAnimalNome] = useState("");
  const [novoAnimalEspecie, setNovoAnimalEspecie] = useState<"Cão" | "Gato" | "">("");
  const [savingAnimal, setSavingAnimal] = useState(false);

  // Compute total from itens reactively
  const watchedItens = useWatch({ control, name: "itens" }) as Array<{ qtd?: number; valorUnitario?: number; desconto?: number }> | undefined;
  const formTotal = (watchedItens ?? []).reduce(
    (s, i) => s + Math.max(0, (Number(i?.qtd) || 0) * (Number(i?.valorUnitario) || 0) - (Number(i?.desconto) || 0)),
    0
  );

  const selectedOpcao = OPCOES_PAGAMENTO.find((o) => o.value === formaPagKey);
  const taxaPct = selectedOpcao?.taxa ?? 0;
  const entrega = cobrarEntrega ? (valorEntrega || 0) : 0;
  const descontoRecompra = !orcamentoSelecionado && clienteRecompra
    ? Math.round(formTotal * DESCONTO_RECOMPRA_PCT * 100) / 100
    : 0;
  const totalBruto = orcamentoSelecionado
    ? Math.max(0, orcamentoSelecionado.total + entrega)
    : Math.max(0, formTotal - descontoRecompra + entrega);
  const lucroLiquido = totalBruto * (1 - taxaPct / 100);

  // Mantém o campo "desconto" do formulário (já suportado pelo backend) em
  // sincronia com o desconto de recompra calculado acima.
  useEffect(() => {
    setValue("desconto", descontoRecompra);
  }, [descontoRecompra, setValue]);

  async function handleQuickCliente(fieldOnChange: (v: string) => void) {
    const nome = quickNome.trim();
    const tel = quickTelefone.replace(/\D/g, "");
    if (nome.length < 2 || tel.length !== 11) {
      toast.error("Informe nome (mín. 2 letras) e telefone com 11 dígitos.");
      return;
    }
    try {
      const novo = await createCliente.mutateAsync({ nome, telefone: quickTelefone, cidade: "Manaus" });
      await selectCliente(novo as Cliente, fieldOnChange);
      setShowQuickCliente(false);
      setQuickNome("");
      setQuickTelefone("");
      toast.success(`Cliente "${novo.nome}" cadastrado e selecionado!`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error("Erro ao criar cliente", { description: msg });
    }
  }

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
    setAnimalOptions([]);
    setAnimalOpen(false);
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

  async function handleSalvarNovoAnimal(onChange: (v: string | null) => void) {
    if (!novoAnimalNome.trim() || !novoAnimalEspecie || !clienteSelected) return;
    setSavingAnimal(true);
    try {
      const animal = await apiAnimais.create({
        nome: novoAnimalNome.trim(),
        especie: novoAnimalEspecie,
        clienteId: clienteSelected.id,
        sexo: "Indefinido",
      });
      selectAnimal(animal, onChange);
      setShowNovoAnimal(false);
      setNovoAnimalNome("");
      setNovoAnimalEspecie("");
      toast.success(`Animal "${animal.nome}" cadastrado!`);
    } catch {
      toast.error("Erro ao cadastrar animal.");
    } finally {
      setSavingAnimal(false);
    }
  }

  // Import an orçamento: fill the form OR use converter flow
  function handleImportOrcamento(o: Orcamento) {
    setOrcamentoSelecionado(o);
    setFormaPagKey("");
  }

  // Converter flow: bypass form validation
  async function handleConfirmarOrcamento() {
    const opcao = OPCOES_PAGAMENTO.find((o) => o.value === formaPagKey);
    if (!opcao) { toast.error("Selecione a forma de pagamento."); return; }
    if (!orcamentoSelecionado) return;
    if (!dataPagamento) { toast.error("Informe a data do pagamento."); return; }
    if (dataPagamento > todayLocalISO()) { toast.error("A data do pagamento não pode ser no futuro."); return; }
    const taxaPctVal = opcao.taxa;
    try {
      const result = await converterOrcamento.mutateAsync({
        id: orcamentoSelecionado.id,
        input: { formaPag: opcao.backend, taxaCartao: taxaPctVal, taxaEntrega: entrega, data: dataPagamento },
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
    const opcao = OPCOES_PAGAMENTO.find((o) => o.value === formaPagKey);
    if (!opcao) { toast.error("Selecione a forma de pagamento."); return; }
    const taxaPctVal = opcao.taxa;
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
          <FormaPagSelect opcoes={OPCOES_PAGAMENTO} value={formaPagKey} onValueChange={(v) => {
            setFormaPagKey(v);
            const opcao = OPCOES_PAGAMENTO.find((o) => o.value === v);
            if (opcao) setValue("formaPag", opcao.backend);
          }} />
          {errors.formaPag && <p className="text-xs text-destructive mt-1">{errors.formaPag.message}</p>}

          {/* Data do pagamento — só no fluxo de orçamento importado; a venda direta usa o campo Data abaixo */}
          {orcamentoSelecionado && (
            <div className="mt-4 space-y-1.5 max-w-xs">
              <Label htmlFor="dataPagamento">Data do pagamento *</Label>
              <Input
                id="dataPagamento"
                type="date"
                value={dataPagamento}
                max={todayLocalISO()}
                onChange={(e) => setDataPagamento(e.target.value)}
              />
              <p className="text-xs text-muted-foreground/70">
                Dia em que o cliente pagou. O orçamento mantém a data do pedido ({formatDate(orcamentoSelecionado.data)}).
              </p>
            </div>
          )}

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
              {descontoRecompra > 0 && (
                <>
                  <span className="text-muted-foreground">− recompra (5%):</span>
                  <span className="font-mono font-semibold text-destructive">−{formatBRL(descontoRecompra)}</span>
                </>
              )}
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
                  <div className="flex items-center justify-between">
                    <Label>Cliente *</Label>
                    {!clienteSelected && !showQuickCliente && (
                      <button
                        type="button"
                        onClick={() => setShowQuickCliente(true)}
                        className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                      >
                        <UserPlus className="w-3 h-3" />
                        Cadastrar novo cliente
                      </button>
                    )}
                  </div>
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
                        {showQuickCliente && (
                          <div className="mt-2 border border-primary/30 bg-primary/5 rounded-md p-3 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-primary/70 flex items-center gap-1">
                              <UserPlus className="w-3 h-3" /> Novo Cliente
                            </p>
                            <div className="flex gap-2">
                              <Input
                                placeholder="Nome completo"
                                value={quickNome}
                                onChange={(e) => setQuickNome(e.target.value)}
                                className="h-8 text-sm"
                              />
                              <Input
                                placeholder="(XX) XXXXX-XXXX"
                                value={quickTelefone}
                                onChange={(e) => setQuickTelefone(formatTelefone(e.target.value))}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                className="h-7 text-xs gap-1"
                                disabled={createCliente.isPending}
                                onClick={() => handleQuickCliente(field.onChange)}
                              >
                                {createCliente.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Salvar
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => { setShowQuickCliente(false); setQuickNome(""); setQuickTelefone(""); }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  />
                  {errors.clienteId && <p className="text-xs text-destructive">{errors.clienteId.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Animal</Label>
                    {clienteSelected && !animalSelected && !showNovoAnimal && (
                      <button
                        type="button"
                        onClick={() => setShowNovoAnimal(true)}
                        className="text-[11px] text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                      >
                        <PawPrint className="w-3 h-3" />
                        Cadastrar novo animal
                      </button>
                    )}
                  </div>
                  <Controller
                    control={control}
                    name="animalId"
                    render={({ field }) => (
                      <div className="space-y-2">
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
                        {showNovoAnimal && (
                          <div className="border border-primary/30 bg-primary/5 rounded-md p-3 space-y-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-primary/70 flex items-center gap-1">
                              <PawPrint className="w-3 h-3" /> Novo Animal
                            </p>
                            <div className="flex gap-2">
                              <Input
                                value={novoAnimalNome}
                                onChange={(e) => setNovoAnimalNome(e.target.value)}
                                placeholder="Nome do animal"
                                className="h-8 text-sm flex-1"
                              />
                              <select
                                value={novoAnimalEspecie}
                                onChange={(e) => setNovoAnimalEspecie(e.target.value as "Cão" | "Gato" | "")}
                                className="h-8 px-2 rounded-md border border-input bg-background text-sm"
                              >
                                <option value="">Espécie</option>
                                <option value="Cão">Cão</option>
                                <option value="Gato">Gato</option>
                              </select>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                className="h-7 text-xs"
                                disabled={!novoAnimalNome.trim() || !novoAnimalEspecie || savingAnimal}
                                onClick={() => handleSalvarNovoAnimal(field.onChange)}
                              >
                                {savingAnimal ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                Salvar
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-muted-foreground"
                                onClick={() => { setShowNovoAnimal(false); setNovoAnimalNome(""); setNovoAnimalEspecie(""); }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
                    <input
                      type="checkbox"
                      checked={clienteRecompra}
                      onChange={(e) => setClienteRecompra(e.target.checked)}
                      className="w-4 h-4 rounded border-input accent-primary"
                    />
                    Cliente já comprou antes (aplicar desconto de recompra 5%)
                  </label>
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
                clienteId={clienteSelected?.id}
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
