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

const COLORS = ["#1e5c30", "#2a7a44", "#3a9a58", "#5cbf7a", "#9adcaa"];

export function TopClientesChart({ clientes }: TopClientesChartProps) {
  const data = clientes.slice(0, 5).map((c) => ({
    nome: c.nome.split(" ")[0],
    nomeCompleto: c.nome,
    totalGasto: c.totalGasto,
    vendas: c.vendas,
  }));

  return (
    <div className="bg-card rounded-lg border border-border/50 p-5 shadow-sm shadow-black/5">
      <h3 className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-5">
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
              tick={{ fontSize: 10, fill: "#6b6460" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="nome"
              tick={{ fontSize: 11, fill: "#6b6460" }}
              axisLine={false}
              tickLine={false}
              width={64}
            />
            <Tooltip
              formatter={(value) => [formatBRL(Number(value ?? 0)), "Total gasto"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? ""}
              labelStyle={{ color: "#1c1917", fontWeight: 600 }}
              contentStyle={{ borderColor: "#dbd5cc", borderRadius: 6, fontSize: 12, background: "#fefcf8" }}
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
