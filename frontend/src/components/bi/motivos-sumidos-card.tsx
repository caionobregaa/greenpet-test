"use client";

import type { MotivoSumidoContagem } from "@/lib/types/bi-avancado";

/** "Por que os clientes somem" — motivos registrados em Clientes > Sumidos (specs/bi-avancado/spec-v3.md). */
export function MotivosSumidosCard({ totalRegistros, motivos }: { totalRegistros: number; motivos: MotivoSumidoContagem[] }) {
  return (
    <div className="bg-card rounded-lg border border-border/50 p-5 shadow-sm shadow-black/5">
      <div className="flex items-baseline justify-between gap-2 mb-4 flex-wrap">
        <h3 className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">
          Por que os clientes somem
        </h3>
        {totalRegistros > 0 && (
          <p className="text-[11px] text-muted-foreground">
            {totalRegistros} {totalRegistros === 1 ? "cliente avaliado" : "clientes avaliados"} · um cliente pode ter vários motivos
          </p>
        )}
      </div>
      {motivos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum motivo registrado no período</p>
      ) : (
        <ul className="space-y-2.5">
          {motivos.map((m) => (
            <li key={m.motivo} data-testid="motivo-sumido">
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="font-medium">{m.motivo}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {m.quantidade} · {m.percentual.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%
                </span>
              </div>
              <div className="h-2 mt-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-[#b06424]" style={{ width: `${Math.min(100, m.percentual)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
