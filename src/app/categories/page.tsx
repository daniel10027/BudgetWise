"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { CategoryModal } from "@/components/categories/CategoryModal";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api-client";
import { ClientCategory } from "@/types";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

function CategoryGrid({
  items,
  currency,
  onEdit,
  onDelete,
}: {
  items: ClientCategory[];
  currency: string;
  onEdit: (c: ClientCategory) => void;
  onDelete: (c: ClientCategory) => void;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-soft py-6 text-center">Aucune catégorie.</p>;
  }
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {items.map((c) => (
        <div
          key={c.id}
          className="flex items-center gap-3 rounded-xl border border-line bg-paper-raised p-4"
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: `${c.color}22`, color: c.color }}
          >
            <CategoryIcon name={c.icon} size={18} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-ink">{c.name}</p>
            {c.monthlyLimit > 0 ? (
              <Badge tone="gold" className="mt-1">
                Limite : {formatCurrency(c.monthlyLimit, currency)}
              </Badge>
            ) : (
              <p className="text-xs text-ink-soft mt-0.5">Sans limite</p>
            )}
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <button
              onClick={() => onEdit(c)}
              aria-label="Modifier"
              className="rounded-md p-1.5 text-ink-soft hover:bg-sage-50 hover:text-sage-600"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => onDelete(c)}
              aria-label="Supprimer"
              className="rounded-md p-1.5 text-ink-soft hover:bg-coral-50 hover:text-coral-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoriesContent() {
  const { user } = useAuth();
  const currency = user?.currency || "XOF";

  const [categories, setCategories] = useState<ClientCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClientCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientCategory | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch<ClientCategory[]>("/api/categories");
    if (res.ok && res.data) setCategories(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteError("");
    const res = await apiFetch(`/api/categories/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Catégorie supprimée");
      setDeleteTarget(null);
      load();
    } else {
      setDeleteError(res.error || "Échec de la suppression");
    }
  }

  function handleEdit(c: ClientCategory) {
    setEditing(c);
    setModalOpen(true);
  }

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Catégories</h1>
          <p className="text-sm text-ink-soft mt-0.5">
            Organisez vos transactions et fixez des limites par poste de dépense.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} />
          Nouvelle catégorie
        </Button>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-sage-300 border-t-sage-600" />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="font-display text-base font-semibold text-ink mb-3">Dépenses</h2>
            <CategoryGrid
              items={expenseCategories}
              currency={currency}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          </section>
          <section>
            <h2 className="font-display text-base font-semibold text-ink mb-3">Revenus</h2>
            <CategoryGrid
              items={incomeCategories}
              currency={currency}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          </section>
        </div>
      )}

      <CategoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        category={editing}
        onSaved={() => {
          setModalOpen(false);
          load();
        }}
      />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-line bg-paper-raised p-6 shadow-xl bw-fade-up">
            <h3 className="font-display text-lg font-semibold text-ink mb-1.5">
              Supprimer &quot;{deleteTarget.name}&quot; ?
            </h3>
            <p className="text-sm text-ink-soft mb-4">
              Les catégories utilisées par des transactions ne peuvent pas être supprimées.
            </p>
            {deleteError && (
              <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-600 mb-4">
                {deleteError}
              </p>
            )}
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

export default function CategoriesPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <CategoriesContent />
      </AppShell>
    </ProtectedRoute>
  );
}
