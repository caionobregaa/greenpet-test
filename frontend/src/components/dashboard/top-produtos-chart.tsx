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

interface TopProduto {
  produtoId: string;
  nome: string;
  totalVendido: number;
  quantidade: number;
}

interface TopProdutosChartProps {
  produtos: TopProduto[];
}

const COLORS = ["#0e5049", "#1a9688", "#2ab8a8", "#7eccc5", "#b2e0db"];

export function TopProdutosChart({ produtos }: TopProdutosChartProps) {
  const data = produtos.slice(0, 5).map((p) => ({
    nome: p.nome.length > 12 ? p.nome.slice(0, 12) + "…" : p.nome,
    nomeCompleto: p.nome,
    totalVendido: p.totalVendido,
    quantidade: p.quantidade,
  }));

  return (
    <div className="bg-card rounded-lg border border-border/50 p-5 shadow-sm shadow-black/5">
      <h3 className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-5">
        Top Produtos
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
              tickFormatter={(v) => `${v}`}
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
              formatter={(value, name) =>
                name === "quantidade"
                  ? [`${value} und.`, "Quantidade"]
                  : [value, name]
              }
              labelFormatter={(_, payload) => payload?.[0]?.payload?.nomeCompleto ?? ""}
              labelStyle={{ color: "#1c1917", fontWeight: 600 }}
              contentStyle={{ borderColor: "#dbd5cc", borderRadius: 6, fontSize: 12, background: "#fefcf8" }}
            />
            <Bar dataKey="quantidade" radius={[0, 4, 4, 0]} maxBarSize={24}>
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
