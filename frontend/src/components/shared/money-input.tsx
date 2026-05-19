"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

interface MoneyInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function MoneyInput({ value, onChange, placeholder = "R$ 0,00", className, disabled }: MoneyInputProps) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (value === undefined || value === null) {
      setDisplay("");
    } else {
      setDisplay(
        new Intl.NumberFormat("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value)
      );
    }
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") {
      setDisplay("");
      onChange(undefined);
      return;
    }
    const numeric = parseInt(raw, 10) / 100;
    setDisplay(
      new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numeric)
    );
    onChange(numeric);
  }

  return (
    <div className={cn("relative", className)}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">
        R$
      </span>
      <Input
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-8"
        disabled={disabled}
      />
    </div>
  );
}
