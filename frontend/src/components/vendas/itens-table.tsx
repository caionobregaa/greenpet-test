"use client";

import { useFieldArray, useWatch, type Control, type UseFormSetValue } from "react-hook-form";
import { useEffect, useRef, useState, memo } from "react";
import { Plus, Trash2, Search } from "lucide-react";
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
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Buscar produto..."
          className="pl-8 h-8 text-xs"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
          {results.map((p) => (
            <button
              key={p.id}
              type="button"
              className="w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors border-b border-border last:border-0"
              onClick={() => {
                onSelect(p);
                setQuery("");
                setResults([]);
                setOpen(false);
              }}
            >
              <p className="font-medium text-foreground">{p.nome}</p>
              <p className="text-muted-foreground">{p.categoria} · {formatBRL(p.valorVenda)}</p>
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
    const q = Number(item?.qtd ?? 0);
    const v = Number(item?.valorUnitario ?? 0);
    return acc + q * v;
  }, 0);

  function addEmpty() {
    append({ produtoId: null, nome: "", qtd: 1, valorUnitario: 0 } as never);
  }

  function selectProduto(index: number, p: Produto) {
    setValue(`itens.${index}.produtoId` as never, p.id as never);
    setValue(`itens.${index}.nome` as never, p.nome as never);
    setValue(`itens.${index}.valorUnitario` as never, p.valorVenda as never);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold">Itens</p>
        <Button type="button" variant="outline" size="sm" onClick={addEmpty}>
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Adicionar Item
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="rounded-lg border border-dashed border-border text-center py-8 text-sm text-muted-foreground">
          Nenhum item adicionado. Clique em &quot;Adicionar Item&quot; para começar.
        </div>
      )}

      {fields.map((field, index) => {
        const item = (itens ?? [])[index] ?? {};
        const subtotal = Number(item.qtd ?? 0) * Number(item.valorUnitario ?? 0);
        return (
          <div key={field.id} className="bg-muted/30 rounded-lg p-3 border border-border space-y-2">
            <div className="grid grid-cols-12 gap-2 items-start">
              {/* Busca produto */}
              <div className="col-span-4">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Produto</p>
                <ProdutoSearch onSelect={(p) => selectProduto(index, p)} />
              </div>
              {/* Nome */}
              <div className="col-span-4">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Descrição *</p>
                <Input
                  {...control.register(`itens.${index}.nome` as never)}
                  placeholder="Nome do item"
                  className="h-8 text-xs"
                />
                {errors?.[index]?.nome && (
                  <p className="text-[10px] text-destructive mt-0.5">{errors[index]?.nome?.message}</p>
                )}
              </div>
              {/* Qtd */}
              <div className="col-span-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Qtd *</p>
                <Input
                  type="number"
                  min="1"
                  {...control.register(`itens.${index}.qtd` as never, { valueAsNumber: true })}
                  className="h-8 text-xs"
                />
              </div>
              {/* Valor */}
              <div className="col-span-2">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Valor Unit. *</p>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...control.register(`itens.${index}.valorUnitario` as never, { valueAsNumber: true })}
                  placeholder="0.00"
                  className="h-8 text-xs"
                />
              </div>
              {/* Total + remove */}
              <div className="col-span-1 flex flex-col items-end">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Total</p>
                <div className="flex items-center gap-1.5 h-8">
                  <span className="text-xs font-bold font-mono text-primary">{formatBRL(subtotal)}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {fields.length > 0 && (
        <div className="flex justify-end pt-1">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total Geral</p>
            <p className="text-xl font-bold text-primary font-mono">{formatBRL(total)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
