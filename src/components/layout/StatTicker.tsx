"use client";

import { formatCurrency } from "@/lib/utils";

interface TickerStat {
  label: string;
  value: number;
  currency: string;
  tone: "sage" | "coral" | "neutral";
}

export function StatTicker({ stats }: { stats: TickerStat[] }) {
  if (stats.length === 0) return null;

  // Duplicate the list so the scroll loop is seamless
  const items = [...stats, ...stats];

  return (
    <div className="overflow-hidden border-b border-line bg-sage-900 text-white">
      <div className="flex w-max bw-ticker-track">
        {items.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-2 whitespace-nowrap px-6 py-2 text-xs font-mono bw-tabular border-r border-white/10"
          >
            <span className="text-white/50 uppercase tracking-wider">{s.label}</span>
            <span
              className={
                s.tone === "sage"
                  ? "text-sage-300 font-semibold"
                  : s.tone === "coral"
                  ? "text-coral-400 font-semibold"
                  : "text-white font-semibold"
              }
            >
              {formatCurrency(s.value, s.currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
