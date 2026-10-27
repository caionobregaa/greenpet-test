"use client";

import Link from "next/link";
import { CheckCircle2, Wallet } from "lucide-react";
import { useVendasEmAberto } from "@/lib/hooks/use-vendas";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBRL, formatDate, todayLocalISO } from "@/lib/utils/format";

const DIA_MS = 24 * 60 * 60 * 1000;

/** Dias desde a venda (pela data local, sem hora). */
export function diasDesde(dataVenda: string, hoje: string = todayLocalISO()): number {
  const inicio = Date.parse(dataVenda.slice(0, 10) + "T00:00:00Z");
  const fim = Date.parse(hoje + "T00:00:00Z");
  return Math.max(0, Math.round((fim - inicio) / DIA_MS));
}

/** Avisos → "Valores em aberto": quem deve, quanto e há quanto tempo (specs/vendas/spec-v6.md). */
export function ValoresEmAberto() {
  const { data, isLoading } = useVendasEmAberto();
  const vendas = data?.data ?? [];

  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <Wallet className="w-5 h-5 text-amber-600" />
        <h2 className="text-base font-semibold">Valores em aberto</h2>
        {!isLoading && vendas.length > 0 && (
          <span className="bg-amber-500 text-white text-[11px] font-bold rounded-full px-2 py-0.5">{vendas.length}</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Vendas em que o cliente não pagou tudo.
        {!isLoading && vendas.length > 0 && (
          <> Total a receber: <strong className="text-foreground font-mono">{formatBRL(data?.meta.totalEmAberto ?? 0)}</strong></>
        )}
      </p>

      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="px-4 py-3 space-y-1.5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : vendas.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500/60" />
            <p className="text-sm text-muted-foreground">Nenhum valor em aberto.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {vendas.map((v) => {
              const dias = diasDesde(v.vendaData);
              return (
                <div key={v.vendaId} className="px-4 py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{v.clienteNome}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {v.clienteTelefone} · Venda V{String(v.vendaNumero).padStart(5, "0")} · {formatDate(v.vendaData)} ·{" "}
                      {dias === 0 ? "hoje" : dias === 1 ? "há 1 dia" : `há ${dias} dias`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Pagou {formatBRL(v.valorPago)} de {formatBRL(v.total)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{formatBRL(v.valorEmAberto)}</span>
                    <Link href={`/vendas/${v.vendaId}`} className="text-xs text-primary underline underline-offset-2 hover:no-underline">
                      Ver venda / receber
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
