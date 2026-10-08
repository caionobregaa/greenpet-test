"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OpcaoPagamento } from "@/lib/utils/formas-pagamento";

/** Seletor de forma de pagamento com a taxa de cada opção (specs/vendas/spec-v2.md). */
export function FormaPagSelect({
  value,
  onValueChange,
  opcoes,
}: {
  value: string;
  onValueChange: (v: string) => void;
  opcoes: OpcaoPagamento[];
}) {
  const [open, setOpen] = useState(false);
  const selected = opcoes.find((o) => o.value === value);

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
          {opcoes.map((o) => (
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
              {o.taxa > 0 && (
                <span className="ml-auto text-xs text-destructive font-medium">
                  −{o.taxa.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
