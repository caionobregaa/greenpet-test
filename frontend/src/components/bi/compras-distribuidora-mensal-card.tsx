"use client";

import { formatBRL } from "@/lib/utils/format";
import { rotuloMesCurto } from "@/lib/utils/mes";
import { cn } from "@/lib/utils";
import type { ComprasDistribuidoraMensal } from "@/lib/types/bi-avancado";

interface ComprasDistribuidoraMensalCardProps {
  dados: ComprasDistribuidoraMensal;
}

/** Maior valor de cada mês (0 = mês sem compras, nada a destacar). */
function maiorPorMes(dados: ComprasDistribuidoraMensal): Record<string, number> {
  return Object.fromEntries(
    dados.meses.map((m) => [m, Math.max(0, ...dados.distribuidoras.map((d) => d.porMes[m] ?? 0))]),
  );
}

export function ComprasDistribuidoraMensalCard({ dados }: ComprasDistribuidoraMensalCardProps) {
  const maior = maiorPorMes(dados);
  const totalGeral = dados.distribuidoras.reduce((s, d) => s + d.total, 0);

  return (
    <div className="bg-card rounded-lg border border-border/50 p-5 shadow-sm shadow-black/5">
      <div className="flex items-baseline justify-between gap-2 mb-4 flex-wrap">
        <h3 className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">
          Compras por Distribuidora — últimos 6 meses
        </h3>
        <p className="text-[11px] text-muted-foreground">
          Despesas de Produtos Pets · em destaque, a maior compra de cada mês
        </p>
      </div>

      {dados.distribuidoras.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhuma compra de produtos nos últimos 6 meses</p>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border/60">
                <th className="text-left py-2 pr-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Distribuidora</th>
                {dados.meses.map((m) => (
                  <th key={m} className="text-right py-2 px-2 font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    {rotuloMesCurto(m)}
                  </th>
                ))}
                <th className="text-right py-2 pl-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody>
              {dados.distribuidoras.map((d) => (
                <tr key={d.fornecedor} className="border-b border-border/40">
                  <td className="py-2 pr-3 font-medium whitespace-nowrap">{d.fornecedor}</td>
                  {dados.meses.map((m) => {
                    const valor = d.porMes[m] ?? 0;
                    const destaque = valor > 0 && valor === maior[m];
                    return (
                      <td
                        key={m}
                        data-destaque={destaque || undefined}
                        className={cn(
                          "py-2 px-2 text-right tabular-nums whitespace-nowrap",
                          valor === 0 && "text-muted-foreground/50",
                          destaque && "font-bold text-primary bg-primary/10 rounded",
                        )}
                      >
                        {valor === 0 ? "—" : formatBRL(valor)}
                      </td>
                    );
                  })}
                  <td className="py-2 pl-3 text-right font-semibold tabular-nums whitespace-nowrap">{formatBRL(d.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-2 pr-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Total do mês</td>
                {dados.meses.map((m) => (
                  <td key={m} className="pt-2 px-2 text-right font-semibold tabular-nums whitespace-nowrap">
                    {formatBRL(dados.totaisPorMes[m] ?? 0)}
                  </td>
                ))}
                <td className="pt-2 pl-3 text-right font-bold text-primary tabular-nums whitespace-nowrap">{formatBRL(totalGeral)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
