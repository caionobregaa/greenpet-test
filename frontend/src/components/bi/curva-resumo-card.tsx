"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CurvaPill } from "@/components/curva-venda/curva-pill";

interface CurvaResumoCardProps {
  resumo: { A: number; B: number; C: number };
}

export function CurvaResumoCard({ resumo }: CurvaResumoCardProps) {
  const total = resumo.A + resumo.B + resumo.C;

  return (
    <div className="bg-card rounded-lg border border-border/50 p-5 shadow-sm shadow-black/5 flex flex-col">
      <h3 className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-5">
        Curva ABC de Produtos
      </h3>

      {total === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado no período</p>
      ) : (
        <div className="space-y-3 flex-1">
          {(["A", "B", "C"] as const).map((curva) => (
            <div key={curva} className="flex items-center justify-between">
              <CurvaPill curva={curva} />
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {resumo[curva]} produto{resumo[curva] !== 1 ? "s" : ""}
              </span>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/curva-venda"
        className="mt-4 pt-4 border-t border-border/60 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
      >
        Ver curva completa
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
