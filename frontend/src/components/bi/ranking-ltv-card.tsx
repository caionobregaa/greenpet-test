import { formatBRL } from "@/lib/utils/format";
import type { ClienteLtv } from "@/lib/types/bi-avancado";

interface RankingLtvCardProps {
  clientes: ClienteLtv[];
  total: number;
}

export function RankingLtvCard({ clientes, total }: RankingLtvCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border/50 p-5 shadow-sm shadow-black/5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">
          Ranking de Clientes por LTV
        </h3>
        <span className="text-xs text-muted-foreground">{total} cliente{total !== 1 ? "s" : ""} no total</span>
      </div>
      {clientes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum cliente com vendas ainda</p>
      ) : (
        <div className="space-y-2">
          {clientes.map((c, i) => (
            <div key={c.clienteId} className="flex items-center gap-3 text-sm">
              <span className="w-5 text-xs font-bold text-muted-foreground/60 tabular-nums shrink-0">{i + 1}º</span>
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{c.nome}</p>
                <p className="text-xs text-muted-foreground">{c.totalVendas} venda{c.totalVendas !== 1 ? "s" : ""}</p>
              </div>
              <span className="font-mono font-semibold tabular-nums shrink-0">{formatBRL(c.totalGasto)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
