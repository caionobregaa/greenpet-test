"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormaPag } from "@/lib/types/venda";

const FORMAS: FormaPag[] = ["Pix", "Dinheiro", "Cartão Crédito", "Cartão Débito", "Boleto"];

interface FormaPagSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export function FormaPagSelect({ value, onValueChange, placeholder = "Selecione..." }: FormaPagSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => { if (v !== null) onValueChange(v); }}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {FORMAS.map((f) => (
          <SelectItem key={f} value={f}>{f}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
