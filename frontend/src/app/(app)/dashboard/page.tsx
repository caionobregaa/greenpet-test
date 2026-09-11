"use client";

import Link from "next/link";
import {
  CalendarClock,
  AlarmClockOff,
  UserX,
  TrendingDown,
  PackageX,
  ArrowRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { useDashboardOperacional } from "@/lib/hooks/use-dashboard-operacional";
import { UrgencyPill } from "@/components/shared/urgency-pill";
import { formatBRL, formatDate } from "@/lib/utils/format";
import type { ComparativoItem } from "@/lib/types/dashboard-operacional";

function formatVariacao(item: ComparativoItem | undefined): string {
  if (!item || item.variacaoPercentual === null) return "sem dado no mês anterior";
  const sinal = item.variacaoPercentual > 0 ? "▲" : item.variacaoPercentual < 0 ? "▼" : "—";
  return `${sinal} ${Math.abs(item.variacaoPercentual).toFixed(1)}% vs mês anterior`;
}

function SectionCard({
  title,
  icon: Icon,
  count,
  tone,
  emptyLabel,
  href,
  children,
}: {
  title: string;
  icon: React.ElementType;
  count: number;
  tone: "amber" | "red" | "muted";
  emptyLabel: string;
  href?: string;
  children: React.ReactNode;
}) {
  const badgeTone =
    tone === "red" ? "bg-red-50 text-red-600" : tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-muted text-muted-foreground";

  return (
    <div className="bg-card rounded-lg border border-border/50 p-5 shadow-sm shadow-black/5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">
          <Icon className="w-3.5 h-3.5" />
          {title}
        </h3>
        <span className={`text-xs font-bold rounded-full px-2 py-0.5 tabular-nums ${badgeTone}`}>{count}</span>
      </div>
      {count === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6 flex-1">{emptyLabel}</p>
      ) : (
        <div className="space-y-2.5 flex-1">{children}</div>
      )}
      {href && count > 0 && (
        <Link
          href={href}
          className="mt-4 pt-3 border-t border-border/60 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          Ver tudo
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboardOperacional();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">O que precisa da sua atenção hoje</p>
      </div>

      {/* Faturamento */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KpiCard label="Faturamento Hoje" value={formatBRL(data?.faturamento.hoje ?? 0)} sub="vendas de hoje" />
          <KpiCard
            label="Faturamento no Mês"
            value={formatBRL(data?.faturamento.periodoAtual.atual ?? 0)}
            sub={formatVariacao(data?.faturamento.periodoAtual)}
          />
        </div>
      )}

      {/* Alertas operacionais */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <SectionCard
            title="Recompras da Semana"
            icon={CalendarClock}
            count={data?.recompraSemana.total ?? 0}
            tone="muted"
            emptyLabel="Nenhuma recompra prevista pros próximos 7 dias"
            href="/recompra"
          >
            {data?.recompraSemana.itens.slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">{a.clienteNome}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.produtoNome}</p>
                </div>
                <UrgencyPill urgencia={a.urgencia} className="shrink-0" />
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Recompras Atrasadas"
            icon={AlarmClockOff}
            count={data?.recompraAtrasada.total ?? 0}
            tone="amber"
            emptyLabel="Nenhum cliente atrasado na recompra"
            href="/recompra"
          >
            {data?.recompraAtrasada.itens.slice(0, 5).map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">{a.clienteNome}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.produtoNome}</p>
                </div>
                <span className="text-xs font-semibold text-amber-700 shrink-0">{Math.abs(a.diasRestantes)}d atrás</span>
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Clientes Sumidos"
            icon={UserX}
            count={data?.clientesSumidos.total ?? 0}
            tone="amber"
            emptyLabel="Nenhum cliente sumido (mais de 30 dias sem recomprar)"
          >
            {data?.clientesSumidos.itens.slice(0, 5).map((c, i) => (
              <div key={i} className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.nome}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.produtoNome}</p>
                </div>
                <span className="text-xs font-semibold text-muted-foreground shrink-0">{c.diasAtraso}d</span>
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Vendas com Margem Negativa"
            icon={TrendingDown}
            count={data?.vendasMargemNegativa.length ?? 0}
            tone="red"
            emptyLabel="Nenhuma venda saiu abaixo do custo"
            href="/vendas"
          >
            {data?.vendasMargemNegativa.slice(0, 5).map((v) => (
              <div key={v.vendaId} className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">Venda #{v.numero} — {v.clienteNome}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(v.data)} · {formatBRL(v.total)}</p>
                </div>
                <span className="text-xs font-bold text-destructive shrink-0">{formatBRL(v.margem)}</span>
              </div>
            ))}
          </SectionCard>

          <SectionCard
            title="Estoque Baixo"
            icon={PackageX}
            count={data?.estoqueBaixo.length ?? 0}
            tone="amber"
            emptyLabel="Nenhum produto com estoque abaixo do mínimo configurado"
            href="/estoque"
          >
            {data?.estoqueBaixo.slice(0, 5).map((p) => (
              <div key={p.produtoId} className="flex items-center justify-between gap-2 text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.nome}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.categoria}</p>
                </div>
                <span className="text-xs font-semibold text-amber-700 shrink-0 tabular-nums">
                  {p.estoqueAtual}/{p.estoqueMinimo}
                </span>
              </div>
            ))}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
