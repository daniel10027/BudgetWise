"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { formatCurrency } from "@/lib/utils";

interface CategorySlice {
  categoryId: string;
  name: string;
  color: string;
  icon: string;
  total: number;
  count: number;
}

export function CategoryBreakdownChart({
  data,
  currency,
}: {
  data: CategorySlice[];
  currency: string;
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center text-sm text-ink-soft">
        Aucune dépense ce mois-ci.
        <br />
        Ajoutez une transaction pour voir la répartition.
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-full sm:w-48 h-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="name"
              innerRadius={56}
              outerRadius={86}
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color || "#3f7d54"} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [formatCurrency(Number(value) || 0, currency), String(name)]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2ddd1",
                fontSize: 13,
                fontFamily: "var(--font-inter)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase tracking-wider text-ink-soft">Total</span>
          <span className="font-mono bw-tabular text-sm font-semibold text-ink">
            {formatCurrency(total, currency)}
          </span>
        </div>
      </div>

      <ul className="flex-1 w-full flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-1">
        {data.map((d) => {
          const pct = total > 0 ? Math.round((d.total / total) * 100) : 0;
          return (
            <li key={d.categoryId} className="flex items-center gap-3">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: `${d.color}22`, color: d.color }}
              >
                <CategoryIcon name={d.icon} size={13} />
              </span>
              <span className="flex-1 min-w-0 truncate text-sm text-ink">{d.name}</span>
              <span className="font-mono bw-tabular text-xs text-ink-soft">{pct}%</span>
              <span className="font-mono bw-tabular text-sm font-medium text-ink w-24 text-right">
                {formatCurrency(d.total, currency)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
