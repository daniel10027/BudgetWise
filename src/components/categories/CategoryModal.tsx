"use client";

import { useEffect, useState, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { CategoryIcon, AVAILABLE_ICONS } from "@/components/ui/CategoryIcon";
import { apiFetch } from "@/lib/api-client";
import { ClientCategory, TxType } from "@/types";
import toast from "react-hot-toast";

const COLOR_OPTIONS = [
  "#3f7d54", "#d85f3f", "#0ea5e9", "#a855f7", "#eab308",
  "#14b8a6", "#ef4444", "#6366f1", "#f97316", "#84cc16",
];

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  category?: ClientCategory | null;
}

export function CategoryModal({ open, onClose, onSaved, category }: CategoryModalProps) {
  const isEdit = Boolean(category);
  const [name, setName] = useState("");
  const [type, setType] = useState<TxType>("expense");
  const [color, setColor] = useState(COLOR_OPTIONS[0]);
  const [icon, setIcon] = useState(AVAILABLE_ICONS[0]);
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (category) {
      setName(category.name);
      setType(category.type);
      setColor(category.color);
      setIcon(category.icon);
      setMonthlyLimit(category.monthlyLimit ? String(category.monthlyLimit) : "");
    } else {
      setName("");
      setType("expense");
      setColor(COLOR_OPTIONS[0]);
      setIcon(AVAILABLE_ICONS[0]);
      setMonthlyLimit("");
    }
    setError("");
  }, [open, category]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Le nom est requis");
      return;
    }

    setSubmitting(true);
    const payload = {
      name: name.trim(),
      type,
      color,
      icon,
      monthlyLimit: monthlyLimit ? parseFloat(monthlyLimit) : 0,
    };

    const res = isEdit
      ? await apiFetch(`/api/categories/${category!.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      : await apiFetch("/api/categories", {
          method: "POST",
          body: JSON.stringify(payload),
        });

    setSubmitting(false);

    if (res.ok) {
      toast.success(isEdit ? "Catégorie mise à jour" : "Catégorie créée");
      onSaved();
    } else {
      setError(res.error || "Une erreur est survenue");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Modifier la catégorie" : "Nouvelle catégorie"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nom de la catégorie"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex : Abonnements"
          maxLength={50}
          required
        />

        <Select label="Type" value={type} onChange={(e) => setType(e.target.value as TxType)}>
          <option value="expense">Dépense</option>
          <option value="income">Revenu</option>
        </Select>

        <div>
          <label className="text-sm font-medium text-ink mb-1.5 block">Couleur</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`Couleur ${c}`}
                className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-105"
                style={{
                  backgroundColor: c,
                  borderColor: color === c ? "#14231d" : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink mb-1.5 block">Icône</label>
          <div className="grid grid-cols-7 gap-2">
            {AVAILABLE_ICONS.map((iconName) => (
              <button
                key={iconName}
                type="button"
                onClick={() => setIcon(iconName)}
                aria-label={`Icône ${iconName}`}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                  icon === iconName
                    ? "border-sage-500 bg-sage-50 text-sage-700"
                    : "border-line text-ink-soft hover:bg-paper"
                }`}
              >
                <CategoryIcon name={iconName} size={15} />
              </button>
            ))}
          </div>
        </div>

        {type === "expense" && (
          <Input
            label="Limite mensuelle (facultatif)"
            type="number"
            min="0"
            step="0.01"
            value={monthlyLimit}
            onChange={(e) => setMonthlyLimit(e.target.value)}
            placeholder="0 = pas de limite"
            hint="Vous recevrez une alerte à 80% et 100% de cette limite."
          />
        )}

        {error && (
          <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-600">{error}</p>
        )}

        <div className="flex gap-2 mt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Créer"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
