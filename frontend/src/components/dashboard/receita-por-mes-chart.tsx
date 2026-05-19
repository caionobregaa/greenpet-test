"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatBRL } from "@/lib/utils/format";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MesData {
  mes: string;
  receita: number;
  vendas: number;
}

interface ReceitaPorMesChartProps {
  data: MesData[];
}

function formatMes(mes: string): string {
  try {
    return format(parseISO(mes + "-01"), "MMM/yy", { locale: ptBR });
  } catch {
    return mes;
  }
}

export function ReceitaPorMesChart({ data }: ReceitaPorMesChartProps) {
  const chartData = data.map((d) => ({ ...d, label: formatMes(d.mes) }));

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-sm">📈</span>
        Receita & Vendas por Mês
      </h3>
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Nenhum dado no período</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barGap={2}>
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#388e3c" />
                <stop offset="100%" stopColor="#00897b" />
              </linearGradient>
              <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0097a7" />
                <stop offset="100%" stopColor="#26c6da" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#d0e8d0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#7a9a7a" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="receita"
              tick={{ fontSize: 11, fill: "#7a9a7a" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
              width={48}
            />
            <YAxis
              yAxisId="vendas"
              orientation="right"
              tick={{ fontSize: 11, fill: "#7a9a7a" }}
              axisLine={false}
              tickLine={false}
              width={32}
              allowDecimals={false}
            />
            <Tooltip
              formatter={(value, name) =>
                name === "receita"
                  ? [formatBRL(Number(value ?? 0)), "Receita"]
                  : [value, "Vendas"]
              }
              labelStyle={{ color: "#1a2e1a", fontWeight: 600 }}
              contentStyle={{ borderColor: "#d0e8d0", borderRadius: 8, fontSize: 12 }}
            />
            <Legend
              formatter={(value) => (value === "receita" ? "Receita" : "Nº Vendas")}
              wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            />
            <Bar
              yAxisId="receita"
              dataKey="receita"
              fill="url(#greenGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
            <Bar
              yAxisId="vendas"
              dataKey="vendas"
              fill="url(#tealGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
