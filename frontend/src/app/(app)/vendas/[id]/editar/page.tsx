"use client";

import { use, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft, Loader2, Search, X, ChevronDown, PawPrint,
} from "lucide-react";
import { UpdateVendaSchema, type UpdateVendaInput } from "@/lib/schemas/venda.schema";
import { useVenda, useUpdateVenda } from "@/lib/hooks/use-vendas";
import { apiAnimais } from "@/lib/api/animais";
import type { Animal } from "@/lib/types/animal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ItensTable } from "@/components/vendas/itens-table";
import { formatBRL } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { OPCOES_PAGAMENTO, opcaoDaVenda, VALUE_TAXA_REGISTRADA, type OpcaoPagamento } from "@/lib/utils/formas-pagamento";
import { FormaPagSelect } from "@/components/vendas/forma-pag-select";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditarVendaPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { data: venda, isLoading } = useVenda(id);
  const updateVenda = useUpdateVenda();
  const [initialized, setInitialized] = useState(false);

  const [formaPagKey, setFormaPagKey] = useState("");
  const [opcaoRegistrada, setOpcaoRegistrada] = useState<OpcaoPagamento | null>(null);
  const opcoes = opcaoRegistrada ? [opcaoRegistrada, ...OPCOES_PAGAMENTO] : OPCOES_PAGAMENTO;
  const [cobrarEntrega, setCobrarEntrega] = useState(false);
  const [valorEntrega, setValorEntrega] = useState(0);

  const [animalQ, setAnimalQ] = useState("");
  const [animalOptions, setAnimalOptions] = useState<Animal[]>([]);
  const [animalOpen, setAnimalOpen] = useState(false);
  const [animalSelected, setAnimalSelected] = useState<Animal | null>(null);
  const animalTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [showNovoAnimal, setShowNovoAnimal] = useState(false);
  const [novoAnimalNome, setNovoAnimalNome] = useState("");
  const [novoAnimalEspecie, setNovoAnimalEspecie] = useState<"Cão" | "Gato" | "">("");
  const [savingAnimal, setSavingAnimal] = useState(false);

  const { register, handleSubmit, control, setValue, reset, formState: { errors } } = useForm<UpdateVendaInput>({
    resolver: zodResolver(UpdateVendaSchema),
  });

  useEffect(() => {
    if (!venda || initialized) return;
    setInitialized(true);
    // Venda de antes da tabela nova mantém a taxa gravada (specs/vendas/spec-v2.md).
    const opcao = opcaoDaVenda(venda.formaPag, venda.taxaCartao);
    setOpcaoRegistrada(opcao.value === VALUE_TAXA_REGISTRADA ? opcao : null);
    setFormaPagKey(opcao.value);
    if (venda.taxaEntrega > 0) { setCobrarEntrega(true); setValorEntrega(venda.taxaEntrega); }
    reset({
      animalId: venda.animalId ?? undefined,
      data: venda.data.slice(0, 10),
      formaPag: venda.formaPag as UpdateVendaInput["formaPag"],
      taxaCartao: venda.taxaCartao,
      taxaEntrega: venda.taxaEntrega,
      obs: venda.obs ?? "",
      itens: venda.itens.map((i) => ({ produtoId: i.produtoId, nome: i.nome, qtd: i.qtd, valorUnitario: i.valorUnitario, desconto: i.desconto, itemAnimalId: i.itemAnimalId ?? null, consumoDiario: i.consumoDiario ?? null, brinde: i.brinde ?? false })),
    });
    if (venda.animalId) {
      setAnimalSelected({ id: venda.animalId, nome: venda.animal?.nome ?? "", especie: "" } as unknown as Animal);
      setAnimalQ(venda.animal?.nome ?? "");
    }
  }, [venda, initialized, reset]);

  function searchAnimais(q: string) {
    setAnimalQ(q);
    clearTimeout(animalTimer.current);
    if (!q.trim() || !venda?.clienteId) { setAnimalOptions([]); setAnimalOpen(false); return; }
    animalTimer.current = setTimeout(async () => {
      try {
        const { data } = await apiAnimais.list({ clienteId: venda.clienteId, q, limit: 8 });
        setAnimalOptions(data);
        setAnimalOpen(data.length > 0);
      } catch { setAnimalOptions([]); }
    }, 300);
  }

  function selectAnimal(a: Animal, onChange: (v: string | null | undefined) => void) {
    setAnimalSelected(a);
    setAnimalQ(a.nome);
    setAnimalOptions([]);
    setAnimalOpen(false);
    onChange(a.id);
  }

  function clearAnimal(onChange: (v: string | null | undefined) => void) {
    setAnimalSelected(null);
    setAnimalQ("");
    setAnimalOptions([]);
    setAnimalOpen(false);
    onChange(null);
  }

  async function handleSalvarNovoAnimal(onChange: (v: string | null | undefined) => void) {
    if (!novoAnimalNome.trim() || !novoAnimalEspecie || !venda?.clienteId) return;
    setSavingAnimal(true);
    try {
      const animal = await apiAnimais.create({ nome: novoAnimalNome.trim(), especie: novoAnimalEspecie, clienteId: venda.clienteId, sexo: "Indefinido" });
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

  async function onSubmit(data: UpdateVendaInput) {
    const opcao = opcoes.find((o) => o.value === formaPagKey);
    if (!opcao) { toast.error("Selecione a forma de pagamento."); return; }
    const taxaPctVal = opcao.taxa;
    try {
      await updateVenda.mutateAsync({
        id,
        input: {
          ...data,
          formaPag: opcao.backend,
          taxaCartao: taxaPctVal,
          taxaEntrega: cobrarEntrega ? (valorEntrega || 0) : 0,
        },
      });
      toast.success("Venda atualizada com sucesso!");
      router.push(`/vendas/${id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      toast.error("Erro ao atualizar venda", { description: msg ?? "Tente novamente." });
    }
  }

  const watchedItens = useWatch({ control, name: "itens" }) as Array<{ qtd?: number; valorUnitario?: number; desconto?: number }> | undefined;
  const formTotal = (watchedItens ?? []).reduce((s, i) => {
    return s + Math.max(0, (Number(i?.qtd) || 0) * (Number(i?.valorUnitario) || 0) - (Number(i?.desconto) || 0));
  }, 0);

  const selectedOpcao = opcoes.find((o) => o.value === formaPagKey);
  const taxaPct = selectedOpcao?.taxa ?? 0;
  const entrega = cobrarEntrega ? (valorEntrega || 0) : 0;
  const totalBruto = Math.max(0, formTotal + entrega);
  const lucroLiquido = totalBruto * (1 - taxaPct / 100);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (!venda) return <p className="text-muted-foreground">Venda não encontrada.</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">
            {venda.numero ? `Editar Venda V${String(venda.numero).padStart(5, "0")}` : `Editar Venda #${id.slice(-6).toUpperCase()}`}
          </h1>
          <p className="text-sm text-muted-foreground">Cliente: {venda.cliente?.nome ?? "—"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Pagamento */}
        <div className="bg-card rounded-lg border border-border/50 p-6 shadow-sm shadow-black/5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground mb-4">Forma de Pagamento *</h2>
          <FormaPagSelect opcoes={opcoes} value={formaPagKey} onValueChange={(v) => {
            setFormaPagKey(v);
            const opcao = opcoes.find((o) => o.value === v);
            if (opcao) setValue("formaPag", opcao.backend);
          }} />

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
                type="number" min="0" step="0.01"
                value={valorEntrega || ""}
                onChange={(e) => setValorEntrega(Number(e.target.value) || 0)}
                placeholder="R$ 0,00" className="w-32 h-8 text-sm"
              />
            )}
          </div>

          {formaPagKey && (
            <div className="mt-3 rounded-lg border border-border bg-accent/30 p-3 flex flex-wrap gap-4 text-sm">
              <span className="text-muted-foreground">Itens:</span>
              <span className="font-mono font-semibold">{formatBRL(formTotal)}</span>
              {entrega > 0 && <><span className="text-muted-foreground">+ entrega:</span><span className="font-mono font-semibold">{formatBRL(entrega)}</span></>}
              <span className="text-muted-foreground">= Total:</span>
              <span className="font-mono font-semibold">{formatBRL(totalBruto)}</span>
              {taxaPct > 0 && <>
                <span className="text-destructive">−{taxaPct}% taxa</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-mono font-bold text-primary">Líquido: {formatBRL(lucroLiquido)}</span>
              </>}
            </div>
          )}
        </div>

        {/* Dados */}
        <div className="bg-card rounded-lg border border-border/50 p-8 shadow-sm shadow-black/5">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground mb-5">Dados da Venda</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">

            <div className="space-y-1.5">
              <Label htmlFor="data">Data *</Label>
              <Input id="data" type="date" {...register("data")} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Animal</Label>
                {!animalSelected && !showNovoAnimal && (
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
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        value={animalQ}
                        onChange={(e) => {
                          if (animalSelected) { setAnimalSelected(null); field.onChange(null); }
                          searchAnimais(e.target.value);
                        }}
                        onBlur={() => setTimeout(() => setAnimalOpen(false), 150)}
                        placeholder="Buscar animal pelo nome..."
                        className="pl-9 pr-8"
                      />
                      {animalSelected && (
                        <button type="button" onClick={() => clearAnimal(field.onChange)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
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
                          <Input value={novoAnimalNome} onChange={(e) => setNovoAnimalNome(e.target.value)} placeholder="Nome do animal" className="h-8 text-sm flex-1" />
                          <select value={novoAnimalEspecie} onChange={(e) => setNovoAnimalEspecie(e.target.value as "Cão" | "Gato" | "")} className="h-8 px-2 rounded-md border border-input bg-background text-sm">
                            <option value="">Espécie</option>
                            <option value="Cão">Cão</option>
                            <option value="Gato">Gato</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" className="h-7 text-xs" disabled={!novoAnimalNome.trim() || !novoAnimalEspecie || savingAnimal} onClick={() => handleSalvarNovoAnimal(field.onChange)}>
                            {savingAnimal ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}Salvar
                          </Button>
                          <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => { setShowNovoAnimal(false); setNovoAnimalNome(""); setNovoAnimalEspecie(""); }}>
                            Cancelar
                          </Button>
                        </div>
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

        {/* Itens */}
        <div className="bg-card rounded-lg border border-border/50 p-8 shadow-sm shadow-black/5">
          <ItensTable
            control={control as unknown as Parameters<typeof ItensTable>[0]["control"]}
            setValue={setValue as unknown as Parameters<typeof ItensTable>[0]["setValue"]}
            errors={errors.itens as Parameters<typeof ItensTable>[0]["errors"]}
            clienteId={venda.clienteId}
          />
          {errors.itens && typeof errors.itens.message === "string" && (
            <p className="text-xs text-destructive mt-2">{errors.itens.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pb-8">
          <Button type="button" variant="ghost" onClick={() => router.back()} className="text-muted-foreground">
            Cancelar
          </Button>
          <Button type="submit" disabled={updateVenda.isPending}>
            {updateVenda.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</> : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
