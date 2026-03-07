"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { ChartData } from "@/types";

interface GrowthChartProps {
  data: ChartData[];
}

const PERIODS = [
  { label: "Este Ano", value: 12 },
  { label: "6 Meses", value: 6 },
  { label: "3 Meses", value: 3 },
];

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
        <p className="text-sm font-semibold text-foreground mb-2">{label}</p>
        {payload.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-xs">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">
              {entry.name === "receita" ? "Receita" : "Despesa"}:
            </span>
            <span className="font-medium">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function GrowthChart({ data }: GrowthChartProps) {
  const [period, setPeriod] = useState(12);
  const filteredData = data.slice(-period);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold">Gráfico de Crescimento</CardTitle>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs px-3"
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={filteredData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(221.2 83.2% 53.3%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDespesa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0 84.2% 60.2%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(0 84.2% 60.2%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              className="text-muted-foreground"
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => value === "receita" ? "Receita" : "Despesa"}
              iconType="circle"
              iconSize={8}
            />
            <Area
              type="monotone"
              dataKey="receita"
              stroke="hsl(221.2 83.2% 53.3%)"
              strokeWidth={2.5}
              fill="url(#colorReceita)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="despesa"
              stroke="hsl(0 84.2% 60.2%)"
              strokeWidth={2.5}
              fill="url(#colorDespesa)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
