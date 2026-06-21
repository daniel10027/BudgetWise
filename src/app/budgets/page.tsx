"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { PiggyBank, Save } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { BudgetProgress } from "@/components/dashboard/BudgetProgress";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api-client";
import { ClientBudget } from "@/types";
import { MONTH_NAMES } from "@/lib/utils";
import toast from "react-hot-toast";

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 1, currentYear, currentYear + 1];

function BudgetsContent() {
  const { user } = useAuth();
  const currency = user?.currency || "XOF";
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [totalLimit, setTotalLimit] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [budgets, setBudgets] = useState<ClientBudget[]>([]);
  const [spent, setSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadBudgets = useCallback(async () => {
    const res = await apiFetch<ClientBudget[]>("/api/budgets");
    if (res.ok && res.data) setBudgets(res.data);
  }, []);

  const loadSpent = useCallback(async () => {
    const res = await apiFetch<{ totalExpense: number }>(
      `/api/dashboard/summary?month=${month}&year=${year}`
    );
    if (res.ok && res.data) setSpent(res.data.totalExpense);
  }, [month, year]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadBudgets(), loadSpent()]).finally(() => setLoading(false));
  }, [loadBudgets, loadSpent]);

  useEffect(() => {
    const existing = budgets.find((b) => b.month === month && b.year === year);
    setTotalLimit(existing ? String(existing.totalLimit) : "");
  }, [month, year, budgets]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const limit = parseFloat(totalLimit);
    if (!limit || limit <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }
    setSubmitting(true);
    const res = await apiFetch("/api/budgets", {
      method: "POST",
      body: JSON.stringify({ month, year, totalLimit: limit }),
    });
    setSubmitting(false);
    if (res.ok) {
      toast.success("Budget enregistré");
      loadBudgets();
      loadSpent();
    } else {
      toast.error(res.error || "Échec de l'enregistrement");
    }
  }

  const currentBudget = budgets.find((b) => b.month === month && b.year === year);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Budgets</h1>
        <p className="text-sm text-ink-soft mt-0.5">
          Définissez une limite de dépenses globale pour chaque mois.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank size={18} className="text-sage-600" />
            Définir un budget mensuel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-3 gap-4 items-end">
            <Select label="Mois" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {MONTH_NAMES.map((m, i) => (
                <option key={m} value={i + 1}>
                  {m}
                </option>
              ))}
            </Select>
            <Select label="Année" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
            <Input
              label="Limite totale"
              type="number"
              min="0"
              step="0.01"
              value={totalLimit}
              onChange={(e) => setTotalLimit(e.target.value)}
              placeholder="Ex : 200000"
              required
            />
            <Button type="submit" className="sm:col-span-3" disabled={submitting}>
              <Save size={16} />
              {submitting ? "Enregistrement..." : "Enregistrer le budget"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {!loading && (
        <div>
          <h2 className="font-display text-base font-semibold text-ink mb-3">
            Progression — {MONTH_NAMES[month - 1]} {year}
          </h2>
          <BudgetProgress
            spent={spent}
            limit={currentBudget?.totalLimit || 0}
            currency={currency}
          />
        </div>
      )}

      {budgets.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-base font-semibold text-ink mb-3">
            Historique des budgets
          </h2>
          <div className="rounded-2xl border border-line bg-paper-raised divide-y divide-line/60">
            {budgets.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-ink">
                  {MONTH_NAMES[b.month - 1]} {b.year}
                </span>
                <span className="font-mono bw-tabular font-medium text-ink">
                  {new Intl.NumberFormat("fr-FR").format(b.totalLimit)} {currency}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BudgetsPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <BudgetsContent />
      </AppShell>
    </ProtectedRoute>
  );
}
