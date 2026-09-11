import type { CicloRecompraCategoria } from "@/lib/types/bi-avancado";

interface CicloRecompraCardProps {
  ciclos: CicloRecompraCategoria[];
}

export function CicloRecompraCard({ ciclos }: CicloRecompraCardProps) {
  const comDados = [...ciclos].sort((a, b) => (b.cicloMedioDias ?? -1) - (a.cicloMedioDias ?? -1));

  return (
    <div className="bg-card rounded-lg border border-border/50 p-5 shadow-sm shadow-black/5">
      <h3 className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-5">
        Ciclo Médio de Recompra por Categoria
      </h3>
      {comDados.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado de recompra ainda</p>
      ) : (
        <div className="space-y-3">
          {comDados.map((c) => (
            <div key={c.categoria} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{c.categoria}</p>
                <p className="text-xs text-muted-foreground">{c.amostras} amostra{c.amostras !== 1 ? "s" : ""}</p>
              </div>
              <span className="font-mono font-semibold tabular-nums">
                {c.cicloMedioDias !== null ? `${c.cicloMedioDias.toFixed(0)} dias` : "—"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
