"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatBRL } from "@/lib/utils/format";
import { buildTicksStep } from "@/lib/utils/chart-ticks";

interface VendaPorFormaPagamento {
  formaPag: string;
  total: number;
  vendas: number;
}

interface VendasPorFormaPagamentoChartProps {
  formasPagamento: VendaPorFormaPagamento[];
}

const COLORS = ["#2f6b4f", "#3f8a68", "#5aa382", "#82c0a5", "#b7ddc9"];

export function VendasPorFormaPagamentoChart({ formasPagamento }: VendasPorFormaPagamentoChartProps) {
  const data = [...formasPagamento]
    .sort((a, b) => b.total - a.total)
    .map((f) => ({
      nome: f.formaPag,
      total: f.total,
      vendas: f.vendas,
    }));

  const maxValue = Math.max(0, ...data.map((d) => d.total));
  const ticks = buildTicksStep(maxValue, 500);

  return (
    <div className="bg-card rounded-lg border border-border/50 p-5 shadow-sm shadow-black/5">
      <h3 className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-5">
        Vendas por Forma de Pagamento
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado no período</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              domain={[0, ticks[ticks.length - 1]]}
              ticks={ticks}
              tick={{ fontSize: 10, fill: "#6b6460" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${v}`}
            />
            <YAxis
              type="category"
              dataKey="nome"
              tick={{ fontSize: 11, fill: "#6b6460" }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip
              formatter={(value, key, entry) => [
                `${formatBRL(Number(value ?? 0))} (${entry.payload.vendas} vendas)`,
                "Total",
              ]}
              labelStyle={{ color: "#1c1917", fontWeight: 600 }}
              contentStyle={{ borderColor: "#dbd5cc", borderRadius: 6, fontSize: 12, background: "#fefcf8" }}
            />
            <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
