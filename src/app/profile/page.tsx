"use client";

import { useState, FormEvent, useEffect } from "react";
import { User as UserIcon, Save } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api-client";
import toast from "react-hot-toast";

const CURRENCIES = ["XOF", "EUR", "USD", "GBP", "MAD", "NGN", "GHS"];

function ProfileContent() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [currency, setCurrency] = useState(user?.currency || "XOF");
  const [monthlyIncome, setMonthlyIncome] = useState(String(user?.monthlyIncome || 0));
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setCurrency(user.currency);
      setMonthlyIncome(String(user.monthlyIncome));
    }
  }, [user]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await apiFetch("/api/profile", {
      method: "PATCH",
      body: JSON.stringify({
        name,
        currency,
        monthlyIncome: parseFloat(monthlyIncome) || 0,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      toast.success("Profil mis à jour");
      refreshUser();
    } else {
      toast.error(res.error || "Échec de la mise à jour");
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Mon profil</h1>
        <p className="text-sm text-ink-soft mt-0.5">
          Gérez vos informations personnelles et préférences.
        </p>
      </div>

      <div className="flex items-center gap-4 mb-6 rounded-2xl border border-line bg-paper-raised p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage-100 text-xl font-semibold text-sage-700">
          {user?.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-ink">{user?.name}</p>
          <p className="text-sm text-ink-soft">{user?.email}</p>
          <Badge tone={user?.role === "admin" ? "gold" : "sage"} className="mt-1.5">
            {user?.role === "admin" ? "Administrateur" : "Utilisateur"}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon size={18} className="text-sage-600" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nom complet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              required
            />
            <Input label="Adresse e-mail" value={user?.email || ""} disabled />
            <Select
              label="Devise"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Input
              label="Revenu mensuel estimé (facultatif)"
              type="number"
              min="0"
              step="0.01"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              hint="Utilisé à titre indicatif uniquement."
            />
            <Button type="submit" className="mt-1 self-start" disabled={submitting}>
              <Save size={16} />
              {submitting ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <ProfileContent />
      </AppShell>
    </ProtectedRoute>
  );
}
