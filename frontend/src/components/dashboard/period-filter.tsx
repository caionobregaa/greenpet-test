"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MESES = [
  { label: "Jan", value: "01" },
  { label: "Fev", value: "02" },
  { label: "Mar", value: "03" },
  { label: "Abr", value: "04" },
  { label: "Mai", value: "05" },
  { label: "Jun", value: "06" },
  { label: "Jul", value: "07" },
  { label: "Ago", value: "08" },
  { label: "Set", value: "09" },
  { label: "Out", value: "10" },
  { label: "Nov", value: "11" },
  { label: "Dez", value: "12" },
];

interface PeriodFilterProps {
  inicio: string;
  fim: string;
  onInicioChange: (v: string) => void;
  onFimChange: (v: string) => void;
}

export function PeriodFilter({ inicio, fim, onInicioChange, onFimChange }: PeriodFilterProps) {
  const [custom, setCustom] = useState(false);
  const year = new Date().getFullYear();

  function selectMonth(mes: string) {
    const lastDay = new Date(year, parseInt(mes), 0).getDate();
    onInicioChange(`${year}-${mes}-01`);
    onFimChange(`${year}-${mes}-${String(lastDay).padStart(2, "0")}`);
    setCustom(false);
  }

  const activeMes = inicio.startsWith(String(year)) ? inicio.slice(5, 7) : null;
  const isMonthActive = (mes: string) =>
    !custom && activeMes === mes && fim === `${year}-${mes}-${String(new Date(year, parseInt(mes), 0).getDate()).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-2 items-end">
      <div className="flex flex-wrap gap-1 justify-end">
        {MESES.map((m) => (
          <Button
            key={m.value}
            type="button"
            variant={isMonthActive(m.value) ? "default" : "outline"}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => selectMonth(m.value)}
          >
            {m.label}
          </Button>
        ))}
        <Button
          type="button"
          variant={custom ? "default" : "outline"}
          size="sm"
          className="h-7 px-3 text-xs"
          onClick={() => setCustom((p) => !p)}
        >
          Personalizado
        </Button>
      </div>
      {custom && (
        <div className="flex items-end gap-3 flex-wrap justify-end">
          <div className="space-y-1">
            <Label className="text-xs">De</Label>
            <Input
              type="date"
              value={inicio}
              onChange={(e) => onInicioChange(e.target.value)}
              className="w-36 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Até</Label>
            <Input
              type="date"
              value={fim}
              onChange={(e) => onFimChange(e.target.value)}
              className="w-36 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
