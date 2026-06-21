"use client";

import { useEffect, useState, FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api-client";
import { ClientCategory, ClientTransaction, TxType } from "@/types";
import toast from "react-hot-toast";

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  transaction?: ClientTransaction | null;
}

function toDateInputValue(date: string | Date | undefined): string {
  const d = date ? new Date(date) : new Date();
  return d.toISOString().slice(0, 10);
}

export function TransactionModal({ open, onClose, onSaved, transaction }: TransactionModalProps) {
  const isEdit = Boolean(transaction);
  const [type, setType] = useState<TxType>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(toDateInputValue(undefined));
  const [categories, setCategories] = useState<ClientCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    apiFetch<ClientCategory[]>(`/api/categories?type=${type}`).then((res) => {
      if (res.ok && res.data) setCategories(res.data);
    });
  }, [open, type]);

  useEffect(() => {
    if (!open) return;
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setCategoryId(
        typeof transaction.category === "string"
          ? transaction.category
          : transaction.category?.id || ""
      );
      setDescription(transaction.description || "");
      setDate(toDateInputValue(transaction.date));
    } else {
      setType("expense");
      setAmount("");
      setCategoryId("");
      setDescription("");
      setDate(toDateInputValue(undefined));
    }
    setError("");
  }, [open, transaction]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setError("Veuillez entrer un montant valide");
      return;
    }
    if (!categoryId) {
      setError("Veuillez choisir une catégorie");
      return;
    }

    setSubmitting(true);

    const payload = {
      type,
      amount: numAmount,
      category: categoryId,
      description,
      date,
    };

    const res = isEdit
      ? await apiFetch(`/api/transactions/${transaction!.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      : await apiFetch("/api/transactions", {
          method: "POST",
          body: JSON.stringify(payload),
        });

    setSubmitting(false);

    if (res.ok) {
      toast.success(isEdit ? "Transaction mise à jour" : "Transaction ajoutée");
      onSaved();
    } else {
      setError(res.error || "Une erreur est survenue");
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Modifier la transaction" : "Nouvelle transaction"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-paper p-1 border border-line">
          <button
            type="button"
            onClick={() => {
              setType("expense");
              setCategoryId("");
            }}
            className={`rounded-md py-2 text-sm font-medium transition-colors ${
              type === "expense" ? "bg-coral-500 text-white" : "text-ink-soft hover:bg-coral-50"
            }`}
          >
            Dépense
          </button>
          <button
            type="button"
            onClick={() => {
              setType("income");
              setCategoryId("");
            }}
            className={`rounded-md py-2 text-sm font-medium transition-colors ${
              type === "income" ? "bg-sage-600 text-white" : "text-ink-soft hover:bg-sage-50"
            }`}
          >
            Revenu
          </button>
        </div>

        <Input
          label="Montant"
          type="number"
          step="0.01"
          min="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
        />

        <Select
          label="Catégorie"
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Sélectionner une catégorie</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Input
          label="Description (facultatif)"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex : Courses au marché"
          maxLength={200}
        />

        <Input
          label="Date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {error && (
          <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-600">{error}</p>
        )}

        <div className="flex gap-2 mt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? "Enregistrement..." : isEdit ? "Mettre à jour" : "Ajouter"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
