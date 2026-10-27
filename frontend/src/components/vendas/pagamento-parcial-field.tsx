"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBRL } from "@/lib/utils/format";

interface PagamentoParcialFieldProps {
  /** Total da venda. */
  total: number;
  /** Valor recebido agora; `undefined` = pago por inteiro. */
  value: number | undefined;
  onChange: (valorRecebido: number | undefined) => void;
}

/** Valor que fica em aberto (nunca negativo). */
export function valorEmAbertoDe(total: number, valorRecebido: number | undefined): number {
  if (valorRecebido === undefined) return 0;
  return Math.max(0, Math.round((total - valorRecebido) * 100) / 100);
}

/** O valor recebido agora é válido (entre 0 e o total)? */
export function valorRecebidoValido(total: number, valorRecebido: number | undefined): boolean {
  if (valorRecebido === undefined) return true;
  return Number.isFinite(valorRecebido) && valorRecebido >= 0 && valorRecebido <= total + 0.005;
}

/**
 * "Cliente não pagou tudo": registra quanto foi recebido agora e mostra o que fica
 * em aberto na venda (specs/vendas/spec-v6.md).
 */
export function PagamentoParcialField({ total, value, onChange }: PagamentoParcialFieldProps) {
  const parcial = value !== undefined;
  const emAberto = valorEmAbertoDe(total, value);
  const valido = valorRecebidoValido(total, value);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
        <input
          type="checkbox"
          checked={parcial}
          onChange={(e) => onChange(e.target.checked ? 0 : undefined)}
          className="w-4 h-4 rounded border-input accent-primary"
        />
        Cliente não pagou tudo (deixar valor em aberto)
      </label>

      {parcial && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3 space-y-2">
          <div className="space-y-1.5">
            <Label htmlFor="valorRecebido">Valor recebido agora (R$)</Label>
            <Input
              id="valorRecebido"
              type="number"
              step="0.01"
              min="0"
              max={total}
              value={Number.isFinite(value) ? value : ""}
              onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
              placeholder="0,00"
              aria-invalid={!valido}
            />
          </div>
          {valido ? (
            <p className="text-sm">
              Fica em aberto:{" "}
              <strong className="font-mono text-amber-700 dark:text-amber-400">{formatBRL(emAberto)}</strong>
              <span className="text-muted-foreground"> de {formatBRL(total)}</span>
            </p>
          ) : (
            <p className="text-sm text-destructive">O valor recebido não pode ser maior que o total ({formatBRL(total)}).</p>
          )}
        </div>
      )}
    </div>
  );
}
