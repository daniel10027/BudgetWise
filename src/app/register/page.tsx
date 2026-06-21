"use client";

import { useState, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wallet, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register, user, loading } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setSubmitting(true);
    const result = await register(name, email, password);
    setSubmitting(false);
    if (result.ok) {
      toast.success("Compte créé avec succès");
      router.push("/dashboard");
    } else {
      setError(result.error || "Échec de la création du compte");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper bw-grain px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-600 text-white">
            <Wallet size={19} />
          </div>
          <span className="font-display text-2xl font-semibold tracking-tight">BudgetWise</span>
        </Link>

        <div className="rounded-2xl border border-line bg-paper-raised p-7 shadow-sm">
          <h1 className="font-display text-2xl font-semibold text-ink mb-1">Créer un compte</h1>
          <p className="text-sm text-ink-soft mb-6">
            Commencez à suivre vos finances en moins de deux minutes.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Nom complet"
              type="text"
              name="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aïssata Koné"
            />
            <Input
              label="Adresse e-mail"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
            />
            <div className="relative">
              <Input
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                hint="Utilisez au moins 8 caractères."
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-[34px] text-ink-soft hover:text-ink"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <p className="rounded-lg bg-coral-50 px-3 py-2 text-sm text-coral-600">{error}</p>
            )}

            <Button type="submit" className="w-full mt-1" disabled={submitting}>
              {submitting ? "Création..." : "Créer mon compte"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-soft">
            Déjà inscrit ?{" "}
            <Link href="/login" className="font-medium text-sage-600 hover:text-sage-700">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
