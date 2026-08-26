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

interface CompraPorFornecedor {
  fornecedor: string;
  totalComprado: number;
  compras: number;
}

interface ComprasPorFornecedorChartProps {
  fornecedores: CompraPorFornecedor[];
}

const COLORS = ["#8a4a1c", "#b06424", "#d68638", "#e8ac6c", "#f2cfa3"];

const STEP = 500;

function buildTicks(maxValue: number): number[] {
  const top = Math.max(STEP, Math.ceil(maxValue / STEP) * STEP);
  const ticks: number[] = [];
  for (let t = 0; t <= top; t += STEP) ticks.push(t);
  return ticks;
}

export function ComprasPorFornecedorChart({ fornecedores }: ComprasPorFornecedorChartProps) {
  const data = fornecedores.slice(0, 5).map((f) => ({
    nome: f.fornecedor.length > 12 ? f.fornecedor.slice(0, 12) + "…" : f.fornecedor,
    nomeCompleto: f.fornecedor,
    totalComprado: f.totalComprado,
    compras: f.compras,
  }));

  const maxValue = Math.max(0, ...data.map((d) => d.totalComprado));
  const ticks = buildTicks(maxValue);

  return (
    <div className="bg-card rounded-lg border border-border/50 p-5 shadow-sm shadow-black/5">
      <h3 className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-5">
        Compras por Distribuidora
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
              width={80}
            />
            <Tooltip
              formatter={(value) => [formatBRL(Number(value ?? 0)), "Total comprado"]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? ""}
              labelStyle={{ color: "#1c1917", fontWeight: 600 }}
              contentStyle={{ borderColor: "#dbd5cc", borderRadius: 6, fontSize: 12, background: "#fefcf8" }}
            />
            <Bar dataKey="totalComprado" radius={[0, 4, 4, 0]} maxBarSize={24}>
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
