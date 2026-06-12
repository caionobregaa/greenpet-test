"use client";

import { useFieldArray, useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import { useRef, useState, useEffect, memo } from "react";
import { Plus, Trash2, Search, Minus, PackageSearch, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBRL } from "@/lib/utils/format";
import { apiProdutos } from "@/lib/api/produtos";
import { apiAnimais } from "@/lib/api/animais";
import type { Produto } from "@/lib/types/produto";

interface ProdutoSelect {
  id: string | null;
  nome: string;
  valorVenda: number;
  categoria?: string;
  pesoEmbalagem?: number | null;
}

interface ItemRow {
  produtoId?: string | null;
  nome: string;
  qtd: number;
  pesoKg?: number | null;
  valorUnitario: number;
  desconto?: number;
  itemAnimalId?: string | null;
  consumoDiario?: number | null;
}

interface ItemExtra {
  categoria?: string;
  pesoEmbalagem?: number | null;
  qtdEmbalagem?: number;
}

interface ItensTableProps {
  control: Control<{ itens: ItemRow[] } & Record<string, unknown>>;
  setValue: UseFormSetValue<{ itens: ItemRow[] } & Record<string, unknown>>;
  errors?: Array<{ nome?: { message?: string }; qtd?: { message?: string }; valorUnitario?: { message?: string } } | undefined>;
  showPesoKg?: boolean;
  clienteId?: string;
}

function calcDuracao(consumoDiario: number | null | undefined, extra: ItemExtra): { dias: number; semanas: number } | null {
  if (!consumoDiario || consumoDiario <= 0) return null;
  if (extra.categoria === "Ração") {
    if (!extra.pesoEmbalagem) return null;
    const dias = Math.round((extra.pesoEmbalagem * 1000) / consumoDiario);
    return { dias, semanas: Math.round(dias / 7) };
  }
  if (extra.categoria === "Medicamento" || extra.categoria === "Suplemento") {
    if (!extra.qtdEmbalagem || extra.qtdEmbalagem <= 0) return null;
    const dias = Math.round(extra.qtdEmbalagem / consumoDiario);
    return { dias, semanas: Math.round(dias / 7) };
  }
  return null;
}

const ProdutoSearch = memo(function ProdutoSearch({
  onSelect,
  autoFocus = false,
}: {
  onSelect: (p: ProdutoSelect) => void;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Produto[]>([]);
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [autoFocus]);

  function handleChange(v: string) {
    setQuery(v);
    clearTimeout(timer.current);
    if (!v.trim()) { setResults([]); setOpen(false); setSearched(false); return; }
    timer.current = setTimeout(async () => {
      try {
        const { data } = await apiProdutos.list({ q: v, limit: 8 });
        setResults(data);
        setOpen(true);
        setSearched(true);
      } catch {
        setResults([]);
      }
    }, 300);
  }

  function pick(p: Produto) {
    onSelect({ id: p.id, nome: p.nome, valorVenda: p.valorVenda, categoria: p.categoria, pesoEmbalagem: p.pesoEmbalagem });
    setQuery(p.nome);
    setResults([]); setOpen(false); setSearched(false);
  }

  function pickSemRegistro() {
    const nome = query.trim() + " (SEM REGISTRO)";
    onSelect({ id: null, nome, valorVenda: 0 });
    setQuery(nome);
    setResults([]); setOpen(false); setSearched(false);
  }

  const showDropdown = open && (results.length > 0 || (searched && query.trim().length >= 2));

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Buscar produto..."
          className="pl-8"
        />
      </div>
      {showDropdown && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border/60 rounded-md shadow-md shadow-black/5 overflow-hidden">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors border-b border-border/40 last:border-0"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(p)}
            >
              <p className="font-medium text-[13px] text-foreground">{p.nome}</p>
              <p className="text-[11px] text-muted-foreground">{p.categoria} · {formatBRL(p.valorVenda)}</p>
            </button>
          ))}
          {searched && results.length === 0 && query.trim().length >= 2 && (
            <button
              type="button"
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-center gap-2"
              onMouseDown={(e) => e.preventDefault()}
              onClick={pickSemRegistro}
            >
              <PackageSearch className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Adicionar <strong>&quot;{query.trim()}&quot;</strong>
                <span className="ml-1 text-[11px] text-amber-600 font-medium">(SEM REGISTRO)</span>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
});

export function ItensTable({ control, setValue, errors, showPesoKg = false, clienteId }: ItensTableProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "itens" as never });
  const itens = useWatch({ control, name: "itens" as never }) as unknown as ItemRow[];
  const [lastAddedIndex, setLastAddedIndex] = useState<number | null>(null);
  const [itemExtras, setItemExtras] = useState<Record<number, ItemExtra>>({});
  const [clienteAnimais, setClienteAnimais] = useState<{ id: string; nome: string; especie: string }[]>([]);

  useEffect(() => {
    if (!clienteId) { setClienteAnimais([]); return; }
    apiAnimais.list({ clienteId, limit: 50 }).then(({ data }) => setClienteAnimais(data)).catch(() => {});
  }, [clienteId]);

  const total = (itens ?? []).reduce((acc, item) => {
    const sub = Math.max(0, Number(item?.qtd ?? 0) * Number(item?.valorUnitario ?? 0) - (Number(item?.desconto) || 0));
    return acc + sub;
  }, 0);

  function addEmpty() {
    const newIndex = fields.length;
    append({ produtoId: null, nome: "", qtd: 1, pesoKg: null, valorUnitario: 0, desconto: 0, itemAnimalId: null, consumoDiario: null } as never);
    setLastAddedIndex(newIndex);
  }

  function selectProduto(index: number, p: ProdutoSelect) {
    setValue(`itens.${index}.produtoId` as never, p.id as never);
    setValue(`itens.${index}.nome` as never, p.nome as never);
    setValue(`itens.${index}.valorUnitario` as never, p.valorVenda as never);
    setItemExtras((prev) => ({
      ...prev,
      [index]: { ...prev[index], categoria: p.categoria, pesoEmbalagem: p.pesoEmbalagem },
    }));
  }

  function updateExtra(index: number, patch: Partial<ItemExtra>) {
    setItemExtras((prev) => ({ ...prev, [index]: { ...prev[index], ...patch } }));
  }

  function stepQtd(index: number, delta: number) {
    const current = Number((itens ?? [])[index]?.qtd ?? 1);
    setValue(`itens.${index}.qtd` as never, Math.max(1, current + delta) as never);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Itens</span>
        <Button type="button" variant="outline" size="sm" onClick={addEmpty} className="h-7 text-xs gap-1">
          <Plus className="w-3 h-3" />
          Adicionar Item
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="rounded-md border border-dashed border-border/50 text-center py-6 text-[11px] text-muted-foreground/60">
          Nenhum item. Clique em &quot;Adicionar Item&quot; para começar.
        </div>
      )}

      <div className="space-y-2">
        {fields.map((field, index) => {
          const item = (itens ?? [])[index] ?? {};
          const subtotal = Math.max(0, Number(item.qtd ?? 0) * Number(item.valorUnitario ?? 0) - (Number(item.desconto) || 0));
          const extra = itemExtras[index] ?? {};
          const isRacao = extra.categoria === "Ração";
          const isMedSupl = extra.categoria === "Medicamento" || extra.categoria === "Suplemento";
          const consumoDiarioVal = Number(item.consumoDiario) > 0 ? Number(item.consumoDiario) : undefined;
          const duracao = calcDuracao(consumoDiarioVal, extra);
          const showConsumoSection = isRacao || isMedSupl || (consumoDiarioVal !== undefined);

          return (
            <div key={field.id} className="bg-muted/20 rounded-md border border-border/50 p-3.5 space-y-3">

              {/* Row 1 — Product search + Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Buscar Produto</p>
                  <ProdutoSearch
                    onSelect={(p) => selectProduto(index, p)}
                    autoFocus={index === lastAddedIndex}
                  />
                  {isRacao && extra.pesoEmbalagem ? (
                    <p className="text-[11px] text-primary/80 font-medium">
                      Embalagem: {extra.pesoEmbalagem} kg
                    </p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Descrição</p>
                  <Input
                    {...control.register(`itens.${index}.nome` as never)}
                    placeholder="Nome do item ou serviço"
                  />
                  {errors?.[index]?.nome && (
                    <p className="text-[11px] text-destructive">{errors[index]?.nome?.message}</p>
                  )}
                </div>
              </div>

              {/* Peso (kg) */}
              {showPesoKg && (
                <div className="space-y-1.5 max-w-[160px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Peso (kg)</p>
                  <Input
                    type="number" step="0.01" min="0"
                    {...control.register(`itens.${index}.pesoKg` as never, { valueAsNumber: true })}
                    placeholder="ex: 15.00"
                  />
                </div>
              )}

              {/* Row 2 — Qty, Unit price, Discount, Subtotal, Delete */}
              <div className="flex items-end gap-3 flex-wrap">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Qtd *</p>
                  <div className="flex items-center border border-input bg-muted/25 rounded-md overflow-hidden h-9">
                    <button type="button" className="w-8 h-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors border-r border-input shrink-0" onClick={() => stepQtd(index, -1)}>
                      <Minus className="w-3 h-3" />
                    </button>
                    <Input
                      type="number" min="1"
                      {...control.register(`itens.${index}.qtd` as never, { valueAsNumber: true })}
                      defaultValue={1}
                      className="w-12 h-full border-0 bg-transparent text-center font-semibold rounded-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button type="button" className="w-8 h-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors border-l border-input shrink-0" onClick={() => stepQtd(index, 1)}>
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 min-w-[100px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Valor Unit. *</p>
                  <Input
                    type="number" step="0.01" min="0"
                    {...control.register(`itens.${index}.valorUnitario` as never, { valueAsNumber: true })}
                    placeholder="0,00"
                  />
                </div>

                <div className="space-y-1.5 w-[110px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Desconto R$</p>
                  <Input
                    type="number" step="0.01" min="0"
                    {...control.register(`itens.${index}.desconto` as never, { valueAsNumber: true })}
                    placeholder="0,00"
                    className="text-primary/80"
                  />
                </div>

                <div className="space-y-1.5 flex-1 min-w-[80px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Subtotal</p>
                  <div className="flex items-center h-9">
                    <span className="text-[13px] font-bold text-primary tabular-nums">{formatBRL(subtotal)}</span>
                    {(Number(item.desconto) || 0) > 0 && (
                      <span className="ml-1 text-[10px] text-primary/60">−{formatBRL(Number(item.desconto))}</span>
                    )}
                  </div>
                </div>

                <Button type="button" variant="ghost" className="h-9 w-9 p-0 text-destructive/50 hover:text-destructive hover:bg-destructive/10 shrink-0" onClick={() => remove(index)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Row 3 — Animal + Consumo (conditional) */}
              {(clienteAnimais.length > 0 || showConsumoSection) && (
                <div className="pt-2.5 border-t border-border/30 space-y-3">

                  {/* Animal select */}
                  {clienteAnimais.length > 0 && (
                    <div className="space-y-1.5 max-w-[200px]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground/70">
                        Animal <span className="font-normal normal-case tracking-normal">— opcional</span>
                      </p>
                      <select
                        {...control.register(`itens.${index}.itemAnimalId` as never)}
                        className="h-9 w-full px-2 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="">Nenhum</option>
                        {clienteAnimais.map((a) => (
                          <option key={a.id} value={a.id}>{a.nome}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Consumo section */}
                  {showConsumoSection && (
                    <div className="flex flex-wrap items-end gap-3">
                      {isRacao && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground/70">
                            Consumo diário (g) <span className="font-normal normal-case tracking-normal">— opcional</span>
                          </p>
                          <Input
                            type="number" min="1" step="1"
                            {...control.register(`itens.${index}.consumoDiario` as never, { setValueAs: (v) => v === "" || v === null || v === undefined ? null : (Number(v) > 0 ? Number(v) : null) })}
                            placeholder="ex: 250"
                            className="w-32 h-8 text-sm"
                          />
                          {extra.pesoEmbalagem && (
                            <p className="text-[10px] text-muted-foreground/60">Embalagem: {extra.pesoEmbalagem * 1000}g</p>
                          )}
                        </div>
                      )}
                      {isMedSupl && (
                        <>
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground/70">
                              Qtd na embalagem <span className="font-normal normal-case tracking-normal">— opcional</span>
                            </p>
                            <Input
                              type="number" min="1" step="1"
                              value={extra.qtdEmbalagem ?? ""}
                              onChange={(e) => updateExtra(index, { qtdEmbalagem: Number(e.target.value) || undefined })}
                              placeholder="ex: 30"
                              className="w-28 h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground/70">Doses por dia</p>
                            <Input
                              type="number" min="0.1" step="0.1"
                              {...control.register(`itens.${index}.consumoDiario` as never, { setValueAs: (v) => v === "" || v === null || v === undefined ? null : (Number(v) > 0 ? Number(v) : null) })}
                              placeholder="ex: 1"
                              className="w-28 h-8 text-sm"
                            />
                          </div>
                        </>
                      )}
                      {!isRacao && !isMedSupl && consumoDiarioVal !== undefined && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground/70">
                            Consumo diário (g) <span className="font-normal normal-case tracking-normal">— opcional</span>
                          </p>
                          <Input
                            type="number" min="1" step="1"
                            {...control.register(`itens.${index}.consumoDiario` as never, { setValueAs: (v) => v === "" || v === null || v === undefined ? null : (Number(v) > 0 ? Number(v) : null) })}
                            placeholder="ex: 250"
                            className="w-32 h-8 text-sm"
                          />
                        </div>
                      )}
                      {duracao && (
                        <div className="flex items-center gap-1.5 pb-0.5 text-primary">
                          <Timer className="w-4 h-4 shrink-0" />
                          <span className="text-sm font-semibold">
                            ~{duracao.dias} dias
                            {duracao.semanas >= 1 && <span className="text-xs font-normal text-muted-foreground ml-1">({duracao.semanas} sem.)</span>}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {fields.length > 0 && (
        <div className="flex justify-end pt-3 border-t border-border/50">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground mb-1">Subtotal Itens</p>
            <p className="text-xl font-bold text-primary tabular-nums">{formatBRL(total)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
