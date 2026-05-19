"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PeriodFilterProps {
  inicio: string;
  fim: string;
  onInicioChange: (v: string) => void;
  onFimChange: (v: string) => void;
}

export function PeriodFilter({ inicio, fim, onInicioChange, onFimChange }: PeriodFilterProps) {
  return (
    <div className="flex items-end gap-3 flex-wrap">
      <div className="space-y-1">
        <Label className="text-xs">De</Label>
        <Input
          type="date"
          value={inicio}
          onChange={(e) => onInicioChange(e.target.value)}
          className="w-40 text-sm"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Até</Label>
        <Input
          type="date"
          value={fim}
          onChange={(e) => onFimChange(e.target.value)}
          className="w-40 text-sm"
        />
      </div>
    </div>
  );
}
