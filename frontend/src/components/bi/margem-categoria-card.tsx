import type { MargemCategoria } from "@/lib/types/bi-avancado";

interface MargemCategoriaCardProps {
  categorias: MargemCategoria[];
}

function corMargem(margem: number | null): string {
  if (margem === null) return "text-muted-foreground";
  return margem >= 30 ? "text-primary" : margem >= 15 ? "text-amber-600" : "text-destructive";
}

export function MargemCategoriaCard({ categorias }: MargemCategoriaCardProps) {
  return (
    <div className="bg-card rounded-lg border border-border/50 p-5 shadow-sm shadow-black/5">
      <h3 className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-1">
        Margem por Categoria
      </h3>
      <p className="text-xs text-muted-foreground/70 mb-5">Catálogo (cadastro) vs. realizada (vendas do período)</p>
      {categorias.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado de margem ainda</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide">
                <th className="pb-2 pr-4">Categoria</th>
                <th className="pb-2 pr-4 text-right">Margem Catálogo</th>
                <th className="pb-2 text-right">Margem Realizada</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((c) => (
                <tr key={c.categoria} className="border-t border-border/50">
                  <td className="py-2 pr-4 font-medium">{c.categoria}</td>
                  <td className={`py-2 pr-4 text-right font-mono tabular-nums ${corMargem(c.margemMediaCatalogo)}`}>
                    {c.margemMediaCatalogo !== null ? `${c.margemMediaCatalogo.toFixed(1)}%` : "—"}
                  </td>
                  <td className={`py-2 text-right font-mono tabular-nums ${corMargem(c.margemRealizada)}`}>
                    {c.margemRealizada !== null ? `${c.margemRealizada.toFixed(1)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
