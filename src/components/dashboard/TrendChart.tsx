"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { MONTH_NAMES, formatCurrency } from "@/lib/utils";

interface TrendPoint {
  month: number;
  year: number;
  income: number;
  expense: number;
}

export function TrendChart({ data, currency }: { data: TrendPoint[]; currency: string }) {
  const chartData = data.map((d) => ({
    name: MONTH_NAMES[d.month - 1].slice(0, 3),
    Revenus: d.income,
    Dépenses: d.expense,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3f7d54" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#3f7d54" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d85f3f" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#d85f3f" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2ddd1" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#4a5a52" }}
          axisLine={{ stroke: "#e2ddd1" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#4a5a52" }}
          axisLine={false}
          tickLine={false}
          width={56}
          tickFormatter={(v) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
          }
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value) || 0, currency)}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid #e2ddd1",
            fontSize: 13,
            fontFamily: "var(--font-inter)",
          }}
        />
        <Area
          type="monotone"
          dataKey="Revenus"
          stroke="#3f7d54"
          strokeWidth={2}
          fill="url(#incomeGradient)"
        />
        <Area
          type="monotone"
          dataKey="Dépenses"
          stroke="#d85f3f"
          strokeWidth={2}
          fill="url(#expenseGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
