"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api-client";
import { ClientCategory, ClientTransaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface TxResponse {
  transactions: ClientTransaction[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

function TransactionsContent() {
  const { user } = useAuth();
  const currency = user?.currency || "XOF";

  const [transactions, setTransactions] = useState<ClientTransaction[]>([]);
  const [categories, setCategories] = useState<ClientCategory[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClientTransaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientTransaction | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    apiFetch<ClientCategory[]>("/api/categories").then((res) => {
      if (res.ok && res.data) setCategories(res.data);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "15");
    if (typeFilter) params.set("type", typeFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    if (debouncedSearch) params.set("search", debouncedSearch);

    const res = await apiFetch<TxResponse>(`/api/transactions?${params.toString()}`);
    if (res.ok && res.data) {
      setTransactions(res.data.transactions);
      setPagination(res.data.pagination);
    }
    setLoading(false);
  }, [page, typeFilter, categoryFilter, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, categoryFilter, debouncedSearch]);

  async function handleDelete() {
    if (!deleteTarget) return;
    const res = await apiFetch(`/api/transactions/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Transaction supprimée");
      setDeleteTarget(null);
      load();
    } else {
      toast.error(res.error || "Échec de la suppression");
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Transactions</h1>
          <p className="text-sm text-ink-soft mt-0.5">{pagination.total} transaction(s) au total</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} />
          Nouvelle transaction
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            type="text"
            placeholder="Rechercher une description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-line bg-paper-raised pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500/40 focus:border-sage-500"
          />
        </div>
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="sm:w-44"
        >
          <option value="">Tous les types</option>
          <option value="expense">Dépenses</option>
          <option value="income">Revenus</option>
        </Select>
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="sm:w-52"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-line bg-paper-raised overflow-hidden">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-sage-300 border-t-sage-600" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <p className="text-sm font-medium text-ink">Aucune transaction trouvée</p>
            <p className="text-xs text-ink-soft mt-1">
              Ajustez vos filtres ou ajoutez votre première transaction.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-soft">
                    <th className="px-4 py-3 font-medium">Catégorie</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium text-right">Montant</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => {
                    const cat = typeof t.category === "object" ? t.category : null;
                    return (
                      <tr key={t.id} className="border-b border-line/60 last:border-0 hover:bg-sage-50/40">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                              style={{
                                backgroundColor: `${cat?.color || "#3f7d54"}22`,
                                color: cat?.color || "#3f7d54",
                              }}
                            >
                              <CategoryIcon name={cat?.icon} size={13} />
                            </span>
                            <span className="text-ink whitespace-nowrap">{cat?.name || "—"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-ink-soft max-w-[220px] truncate">
                          {t.description || "—"}
                        </td>
                        <td className="px-4 py-3 text-ink-soft whitespace-nowrap">
                          {formatDate(t.date)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-mono bw-tabular font-semibold whitespace-nowrap ${
                            t.type === "income" ? "text-sage-600" : "text-coral-600"
                          }`}
                        >
                          {t.type === "income" ? "+" : "−"}
                          {formatCurrency(t.amount, currency)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditing(t);
                                setModalOpen(true);
                              }}
                              aria-label="Modifier"
                              className="rounded-md p-1.5 text-ink-soft hover:bg-sage-50 hover:text-sage-600"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(t)}
                              aria-label="Supprimer"
                              className="rounded-md p-1.5 text-ink-soft hover:bg-coral-50 hover:text-coral-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-line">
                <span className="text-xs text-ink-soft">
                  Page {pagination.page} sur {pagination.totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        transaction={editing}
        onSaved={() => {
          setModalOpen(false);
          load();
        }}
      />

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-line bg-paper-raised p-6 shadow-xl bw-fade-up">
            <button
              onClick={() => setDeleteTarget(null)}
              className="absolute right-4 top-4 text-ink-soft hover:text-ink"
              aria-label="Fermer"
            >
              <X size={16} />
            </button>
            <h3 className="font-display text-lg font-semibold text-ink mb-1.5">
              Supprimer la transaction ?
            </h3>
            <p className="text-sm text-ink-soft mb-5">
              Cette action est définitive et ne peut pas être annulée.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setDeleteTarget(null)}>
                Annuler
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleDelete}>
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <TransactionsContent />
      </AppShell>
    </ProtectedRoute>
  );
}
