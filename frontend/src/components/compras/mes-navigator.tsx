"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mesAtual, deslocarMes, rotuloMes } from "@/lib/utils/mes";

export function MesNavigator({ mes, onChange }: { mes: string; onChange: (mes: string) => void }) {
  const hoje = mesAtual();
  return (
    <div className="flex items-center gap-1">
      <Button variant="outline" size="sm" className="h-9 w-9 p-0" aria-label="Mês anterior" onClick={() => onChange(deslocarMes(mes, -1))}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="min-w-[10.5rem] text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {rotuloMes(mes)}
      </span>
      <Button variant="outline" size="sm" className="h-9 w-9 p-0" aria-label="Próximo mês" onClick={() => onChange(deslocarMes(mes, 1))}>
        <ChevronRight className="w-4 h-4" />
      </Button>
      {mes !== hoje && (
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => onChange(hoje)}>
          Mês atual
        </Button>
      )}
    </div>
  );
}
