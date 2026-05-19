import { formatBRL } from "@/lib/utils/format";

interface TopProduto {
  produtoId: string;
  nome: string;
  totalVendido: number;
  quantidade: number;
}

interface TopProdutosCardProps {
  produtos: TopProduto[];
}

export function TopProdutosCard({ produtos }: TopProdutosCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-sm">📦</span>
        Top Produtos
      </h3>
      {produtos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado no período</p>
      ) : (
        <div className="space-y-3">
          {produtos.slice(0, 5).map((p, i) => (
            <div key={p.produtoId} className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-muted-foreground w-4 shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{p.nome}</p>
                <p className="text-xs text-muted-foreground">{p.quantidade} un.</p>
              </div>
              <span className="text-sm font-bold text-primary font-mono whitespace-nowrap">
                {formatBRL(p.totalVendido)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
