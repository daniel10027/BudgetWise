import { formatCurrency, cn } from "@/lib/utils";

export function BudgetProgress({
  spent,
  limit,
  currency,
}: {
  spent: number;
  limit: number;
  currency: string;
}) {
  if (limit <= 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-5 text-center">
        <p className="text-sm text-ink-soft">
          Aucun budget mensuel défini.{" "}
          <a href="/budgets" className="font-medium text-sage-600 hover:text-sage-700">
            En créer un
          </a>
        </p>
      </div>
    );
  }

  const ratio = Math.min(1, spent / limit);
  const pct = Math.round(ratio * 100);
  const over = spent > limit;

  const barColor = over ? "bg-coral-500" : pct >= 80 ? "bg-gold-400" : "bg-sage-500";

  return (
    <div className="rounded-2xl border border-line bg-paper-raised p-5">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-medium text-ink">Budget mensuel</span>
        <span className="font-mono bw-tabular text-xs text-ink-soft">
          {formatCurrency(spent, currency)} / {formatCurrency(limit, currency)}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-line/60">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p
        className={cn(
          "mt-2 text-xs",
          over ? "text-coral-600 font-medium" : "text-ink-soft"
        )}
      >
        {over
          ? `Dépassement de ${formatCurrency(spent - limit, currency)}`
          : `${pct}% du budget utilisé · reste ${formatCurrency(limit - spent, currency)}`}
      </p>
    </div>
  );
}
