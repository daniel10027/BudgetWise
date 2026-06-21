"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Receipt, TrendingUp, UserPlus, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, formatDate, MONTH_NAMES } from "@/lib/utils";
import toast from "react-hot-toast";

interface AdminStats {
  totalUsers: number;
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  newUsersThisMonth: number;
  signupTrend: { month: number; year: number; count: number }[];
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  currency: string;
  transactionCount: number;
  createdAt: string;
}

function AdminContent() {
  const { user: currentUser } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [statsRes, usersRes] = await Promise.all([
      apiFetch<AdminStats>("/api/admin/stats"),
      apiFetch<AdminUser[]>("/api/admin/users"),
    ]);
    if (statsRes.ok && statsRes.data) setStats(statsRes.data);
    if (usersRes.ok && usersRes.data) setUsers(usersRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleRole(u: AdminUser) {
    const newRole = u.role === "admin" ? "user" : "admin";
    const res = await apiFetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      toast.success(`${u.name} est maintenant ${newRole === "admin" ? "administrateur" : "utilisateur"}`);
      load();
    } else {
      toast.error(res.error || "Échec de la mise à jour");
    }
  }

  async function deleteUser(u: AdminUser) {
    if (!confirm(`Supprimer le compte de ${u.name} ? Cette action est définitive.`)) return;
    const res = await apiFetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Utilisateur supprimé");
      load();
    } else {
      toast.error(res.error || "Échec de la suppression");
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sage-300 border-t-sage-600" />
      </div>
    );
  }

  const signupData = stats.signupTrend.map((s) => ({
    name: `${MONTH_NAMES[s.month - 1].slice(0, 3)} ${s.year}`,
    Inscriptions: s.count,
  }));

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink flex items-center gap-2">
          <ShieldCheck size={22} className="text-sage-600" />
          Console administrateur
        </h1>
        <p className="text-sm text-ink-soft mt-0.5">
          Vue d&apos;ensemble de la plateforme et gestion des utilisateurs.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl border border-line bg-paper-raised p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">
              Utilisateurs
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-sage-700">
              <Users size={15} />
            </div>
          </div>
          <p className="text-2xl font-semibold font-mono bw-tabular text-ink">{stats.totalUsers}</p>
        </div>
        <div className="rounded-2xl border border-line bg-paper-raised p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">
              Transactions
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-sage-700">
              <Receipt size={15} />
            </div>
          </div>
          <p className="text-2xl font-semibold font-mono bw-tabular text-ink">
            {stats.totalTransactions}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-paper-raised p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">
              Nouveaux ce mois
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-sage-700">
              <UserPlus size={15} />
            </div>
          </div>
          <p className="text-2xl font-semibold font-mono bw-tabular text-ink">
            {stats.newUsersThisMonth}
          </p>
        </div>
        <div className="rounded-2xl border border-line bg-paper-raised p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">
              Volume total
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-sage-700">
              <TrendingUp size={15} />
            </div>
          </div>
          <p className="text-lg font-semibold font-mono bw-tabular text-ink">
            {formatCurrency(stats.totalIncome + stats.totalExpense, "XOF")}
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Inscriptions par mois</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={signupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2ddd1" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#4a5a52" }} axisLine={{ stroke: "#e2ddd1" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#4a5a52" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2ddd1", fontSize: 13 }}
              />
              <Bar dataKey="Inscriptions" fill="#3f7d54" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="!p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-soft">
                  <th className="px-5 py-3 font-medium">Nom</th>
                  <th className="px-5 py-3 font-medium">E-mail</th>
                  <th className="px-5 py-3 font-medium">Rôle</th>
                  <th className="px-5 py-3 font-medium">Transactions</th>
                  <th className="px-5 py-3 font-medium">Inscrit le</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-line/60 last:border-0 hover:bg-sage-50/40">
                    <td className="px-5 py-3 text-ink font-medium whitespace-nowrap">{u.name}</td>
                    <td className="px-5 py-3 text-ink-soft">{u.email}</td>
                    <td className="px-5 py-3">
                      <Badge tone={u.role === "admin" ? "gold" : "neutral"}>
                        {u.role === "admin" ? "Admin" : "Utilisateur"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 font-mono bw-tabular text-ink-soft">
                      {u.transactionCount}
                    </td>
                    <td className="px-5 py-3 text-ink-soft whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleRole(u)}
                          disabled={u.id === currentUser?.id}
                          aria-label="Changer le rôle"
                          title={u.role === "admin" ? "Rétrograder en utilisateur" : "Promouvoir en admin"}
                          className="rounded-md p-1.5 text-ink-soft hover:bg-sage-50 hover:text-sage-600 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          {u.role === "admin" ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                        </button>
                        <button
                          onClick={() => deleteUser(u)}
                          disabled={u.id === currentUser?.id}
                          aria-label="Supprimer"
                          className="rounded-md p-1.5 text-ink-soft hover:bg-coral-50 hover:text-coral-600 disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute adminOnly>
      <AppShell>
        <AdminContent />
      </AppShell>
    </ProtectedRoute>
  );
}
