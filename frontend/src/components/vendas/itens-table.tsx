"use client";

import { useFieldArray, useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import { useRef, useState, memo } from "react";
import { Plus, Trash2, Search, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBRL } from "@/lib/utils/format";
import { apiProdutos } from "@/lib/api/produtos";
import type { Produto } from "@/lib/types/produto";

interface ItemRow {
  produtoId?: string | null;
  nome: string;
  qtd: number;
  valorUnitario: number;
}

interface ItensTableProps {
  control: Control<{ itens: ItemRow[] } & Record<string, unknown>>;
  setValue: UseFormSetValue<{ itens: ItemRow[] } & Record<string, unknown>>;
  errors?: Array<{ nome?: { message?: string }; qtd?: { message?: string }; valorUnitario?: { message?: string } } | undefined>;
}

const ProdutoSearch = memo(function ProdutoSearch({
  onSelect,
}: {
  onSelect: (p: Produto) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Produto[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  function handleChange(v: string) {
    setQuery(v);
    clearTimeout(timer.current);
    if (!v.trim()) { setResults([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      try {
        const { data } = await apiProdutos.list({ q: v, limit: 8 });
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 300);
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50 pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Buscar produto..."
          className="pl-8"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border/60 rounded-md shadow-md shadow-black/5 overflow-hidden">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors border-b border-border/40 last:border-0"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(p);
                setQuery(p.nome);
                setResults([]);
                setOpen(false);
              }}
            >
              <p className="font-medium text-[13px] text-foreground">{p.nome}</p>
              <p className="text-[11px] text-muted-foreground">{p.categoria} · {formatBRL(p.valorVenda)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

export function ItensTable({ control, setValue, errors }: ItensTableProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "itens" as never });
  const itens = useWatch({ control, name: "itens" as never }) as unknown as ItemRow[];

  const total = (itens ?? []).reduce((acc, item) => {
    return acc + Number(item?.qtd ?? 0) * Number(item?.valorUnitario ?? 0);
  }, 0);

  function addEmpty() {
    append({ produtoId: null, nome: "", qtd: 1, valorUnitario: 0 } as never);
  }

  function selectProduto(index: number, p: Produto) {
    setValue(`itens.${index}.produtoId` as never, p.id as never);
    setValue(`itens.${index}.nome` as never, p.nome as never);
    setValue(`itens.${index}.valorUnitario` as never, p.valorVenda as never);
  }

  function stepQtd(index: number, delta: number) {
    const current = Number((itens ?? [])[index]?.qtd ?? 1);
    const next = Math.max(1, current + delta);
    setValue(`itens.${index}.qtd` as never, next as never);
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
          const subtotal = Number(item.qtd ?? 0) * Number(item.valorUnitario ?? 0);

          return (
            <div key={field.id} className="bg-muted/20 rounded-md border border-border/50 p-3.5 space-y-3">

              {/* Row 1 — Product search + Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Buscar Produto</p>
                  <ProdutoSearch onSelect={(p) => selectProduto(index, p)} />
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Descrição *</p>
                  <Input
                    {...control.register(`itens.${index}.nome` as never)}
                    placeholder="Nome do item ou serviço"
                  />
                  {errors?.[index]?.nome && (
                    <p className="text-[11px] text-destructive">{errors[index]?.nome?.message}</p>
                  )}
                </div>
              </div>

              {/* Row 2 — Qty, Unit price, Subtotal, Delete */}
              <div className="flex items-end gap-3 flex-wrap">

                {/* Quantity stepper */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Qtd *</p>
                  <div className="flex items-center border border-input bg-muted/25 rounded-md overflow-hidden h-9">
                    <button
                      type="button"
                      className="w-8 h-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors border-r border-input shrink-0"
                      onClick={() => stepQtd(index, -1)}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <Input
                      type="number"
                      min="1"
                      {...control.register(`itens.${index}.qtd` as never, { valueAsNumber: true })}
                      defaultValue={1}
                      className="w-12 h-full border-0 bg-transparent text-center font-semibold rounded-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      className="w-8 h-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors border-l border-input shrink-0"
                      onClick={() => stepQtd(index, 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Unit price */}
                <div className="space-y-1.5 flex-1 min-w-[100px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Valor Unit. *</p>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...control.register(`itens.${index}.valorUnitario` as never, { valueAsNumber: true })}
                    placeholder="0,00"
                  />
                </div>

                {/* Subtotal */}
                <div className="space-y-1.5 flex-1 min-w-[80px]">
                  <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">Subtotal</p>
                  <div className="flex items-center h-9">
                    <span className="text-[13px] font-bold text-primary tabular-nums">{formatBRL(subtotal)}</span>
                  </div>
                </div>

                {/* Delete */}
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 w-9 p-0 text-destructive/50 hover:text-destructive hover:bg-destructive/10 shrink-0 mb-0"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>

            </div>
          );
        })}
      </div>

      {fields.length > 0 && (
        <div className="flex justify-end pt-3 border-t border-border/50">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground mb-1">Total Geral</p>
            <p className="text-xl font-bold text-primary tabular-nums">{formatBRL(total)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
