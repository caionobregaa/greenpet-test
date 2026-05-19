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

interface TopCliente {
  clienteId: string;
  nome: string;
  totalGasto: number;
  vendas: number;
}

interface TopClientesChartProps {
  clientes: TopCliente[];
}

const COLORS = ["#2e7d32", "#388e3c", "#43a047", "#66bb6a", "#a5d6a7"];

export function TopClientesChart({ clientes }: TopClientesChartProps) {
  const data = clientes.slice(0, 5).map((c) => ({
    nome: c.nome.split(" ")[0],
    nomeCompleto: c.nome,
    totalGasto: c.totalGasto,
    vendas: c.vendas,
  }));

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-sm">🏆</span>
        Top Clientes
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
              tick={{ fontSize: 10, fill: "#7a9a7a" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="nome"
              tick={{ fontSize: 11, fill: "#4a7a4a" }}
              axisLine={false}
              tickLine={false}
              width={64}
            />
            <Tooltip
              formatter={(value) => [formatBRL(Number(value ?? 0)), "Total gasto"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? ""}
              labelStyle={{ color: "#1a2e1a", fontWeight: 600 }}
              contentStyle={{ borderColor: "#d0e8d0", borderRadius: 8, fontSize: 12 }}
            />
            <Bar dataKey="totalGasto" radius={[0, 4, 4, 0]} maxBarSize={24}>
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
