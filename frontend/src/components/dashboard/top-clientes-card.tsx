import { formatBRL } from "@/lib/utils/format";

interface TopCliente {
  clienteId: string;
  nome: string;
  totalGasto: number;
  vendas: number;
}

interface TopClientesCardProps {
  clientes: TopCliente[];
}

export function TopClientesCard({ clientes }: TopClientesCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-sm">🏆</span>
        Top Clientes
      </h3>
      {clientes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado no período</p>
      ) : (
        <div className="space-y-3">
          {clientes.slice(0, 5).map((c, i) => (
            <div key={c.clienteId} className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-muted-foreground w-4 shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{c.nome}</p>
                <p className="text-xs text-muted-foreground">{c.vendas} venda{c.vendas !== 1 ? "s" : ""}</p>
              </div>
              <span className="text-sm font-bold text-primary font-mono whitespace-nowrap">
                {formatBRL(c.totalGasto)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
