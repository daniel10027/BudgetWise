"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Plus,
  ArrowRight,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { StatTicker } from "@/components/layout/StatTicker";
import { StatCard } from "@/components/dashboard/StatCard";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { CategoryBreakdownChart } from "@/components/dashboard/CategoryBreakdownChart";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api-client";
import { formatCurrency, formatDate, MONTH_NAMES } from "@/lib/utils";

interface DashboardSummary {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  budgetLimit: number;
  byCategory: {
    categoryId: string;
    name: string;
    color: string;
    icon: string;
    total: number;
    count: number;
  }[];
  trend: { month: number; year: number; income: number; expense: number }[];
  recentTransactions: {
    id: string;
    category: { id: string; name?: string; color?: string; icon?: string } | null;
    type: "income" | "expense";
    amount: number;
    description: string;
    date: string;
  }[];
}

function DashboardContent() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const currency = user?.currency || "XOF";

  const load = useCallback(async () => {
    const now = new Date();
    const res = await apiFetch<DashboardSummary>(
      `/api/dashboard/summary?month=${now.getMonth() + 1}&year=${now.getFullYear()}`
    );
    if (res.ok && res.data) {
      setSummary(res.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading || !summary) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sage-300 border-t-sage-600" />
      </div>
    );
  }

  const tickerStats = [
    { label: "Revenus", value: summary.totalIncome, currency, tone: "sage" as const },
    { label: "Dépenses", value: summary.totalExpense, currency, tone: "coral" as const },
    { label: "Solde net", value: summary.netBalance, currency, tone: "neutral" as const },
    ...summary.byCategory.slice(0, 4).map((c) => ({
      label: c.name,
      value: c.total,
      currency,
      tone: "coral" as const,
    })),
  ];

  return (
    <>
      <StatTicker stats={tickerStats} />

      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Tableau de bord</h1>
            <p className="text-sm text-ink-soft mt-0.5">
              {MONTH_NAMES[summary.month - 1]} {summary.year}
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Nouvelle transaction
          </Button>
        </div>

        {/* KPI cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Revenus du mois"
            value={summary.totalIncome}
            currency={currency}
            icon={TrendingUp}
            tone="sage"
          />
          <StatCard
            label="Dépenses du mois"
            value={summary.totalExpense}
            currency={currency}
            icon={TrendingDown}
            tone="coral"
          />
          <StatCard
            label="Solde net"
            value={summary.netBalance}
            currency={currency}
            icon={Scale}
            tone={summary.netBalance >= 0 ? "sage" : "coral"}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tendance sur 6 mois</CardTitle>
            </CardHeader>
            <CardContent>
              <TrendChart data={summary.trend} currency={currency} />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <BudgetProgress
              spent={summary.totalExpense}
              limit={summary.budgetLimit}
              currency={currency}
            />
            <Card className="flex-1">
              <CardHeader>
                <CardTitle className="text-base">Transactions récentes</CardTitle>
              </CardHeader>
              <CardContent className="!pt-0">
                {summary.recentTransactions.length === 0 ? (
                  <p className="text-sm text-ink-soft py-4 text-center">Aucune transaction.</p>
                ) : (
                  <ul className="flex flex-col">
                    {summary.recentTransactions.slice(0, 5).map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center gap-3 py-2.5 border-b border-line/60 last:border-0"
                      >
                        <span
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                          style={{
                            backgroundColor: `${t.category?.color || "#3f7d54"}22`,
                            color: t.category?.color || "#3f7d54",
                          }}
                        >
                          <CategoryIcon name={t.category?.icon} size={13} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-xs font-medium text-ink">
                            {t.description || t.category?.name || "Transaction"}
                          </p>
                          <p className="text-[11px] text-ink-soft">{formatDate(t.date)}</p>
                        </div>
                        <span
                          className={`font-mono bw-tabular text-xs font-semibold ${
                            t.type === "income" ? "text-sage-600" : "text-coral-600"
                          }`}
                        >
                          {t.type === "income" ? "+" : "−"}
                          {formatCurrency(t.amount, currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href="/transactions"
                  className="mt-2 flex items-center justify-center gap-1.5 text-xs font-medium text-sage-600 hover:text-sage-700 py-1.5"
                >
                  Voir toutes les transactions
                  <ArrowRight size={13} />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des dépenses par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBreakdownChart data={summary.byCategory} currency={currency} />
          </CardContent>
        </Card>
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          setModalOpen(false);
          load();
        }}
      />
    </>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <DashboardContent />
      </AppShell>
    </ProtectedRoute>
  );
}
