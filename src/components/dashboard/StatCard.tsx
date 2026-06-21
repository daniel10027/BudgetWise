import { LucideIcon } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

export function StatCard({
  label,
  value,
  currency,
  icon: Icon,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: number;
  currency: string;
  icon: LucideIcon;
  tone?: "sage" | "coral" | "neutral";
  hint?: string;
}) {
  const toneClasses: Record<string, string> = {
    sage: "bg-sage-100 text-sage-700",
    coral: "bg-coral-100 text-coral-600",
    neutral: "bg-line/60 text-ink-soft",
  };

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">
          {label}
        </span>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", toneClasses[tone])}>
          <Icon size={15} />
        </div>
      </div>
      <p className="font-mono bw-tabular text-2xl font-semibold text-ink">
        {formatCurrency(value, currency)}
      </p>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
    </div>
  );
}
