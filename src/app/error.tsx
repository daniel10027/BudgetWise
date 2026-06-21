"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper bw-grain px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-coral-100 text-coral-600 mb-6">
        <AlertTriangle size={22} />
      </div>
      <h1 className="font-display text-2xl font-semibold text-ink">Une erreur est survenue</h1>
      <p className="mt-2 text-ink-soft max-w-sm">
        Quelque chose s&apos;est mal passé de notre côté. Vous pouvez réessayer ou revenir à
        l&apos;accueil.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={reset}>
          Réessayer
        </Button>
        <Link href="/">
          <Button>Retour à l&apos;accueil</Button>
        </Link>
      </div>
    </div>
  );
}
