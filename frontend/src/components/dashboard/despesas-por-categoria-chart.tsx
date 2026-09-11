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

interface DespesaPorCategoria {
  categoria: string;
  total: number;
  compras: number;
}

interface DespesasPorCategoriaChartProps {
  categorias: DespesaPorCategoria[];
}

const COLORS = ["#7a3b6e", "#9a4f8c", "#b56ea8", "#cc98c1", "#e4c3db"];

export function DespesasPorCategoriaChart({ categorias }: DespesasPorCategoriaChartProps) {
  const data = [...categorias]
    .sort((a, b) => b.total - a.total)
    .map((c) => ({
      nome: c.categoria.length > 14 ? c.categoria.slice(0, 14) + "…" : c.categoria,
      nomeCompleto: c.categoria,
      total: c.total,
      compras: c.compras,
    }));

  const maxValue = Math.max(0, ...data.map((d) => d.total));
  const ticks = buildTicksStep(maxValue, 500);

  return (
    <div className="bg-card rounded-lg border border-border/50 p-5 shadow-sm shadow-black/5">
      <h3 className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-5">
        Despesas por Categoria
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
              width={90}
            />
            <Tooltip
              formatter={(value) => [formatBRL(Number(value ?? 0)), "Total"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? ""}
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
