import Link from "next/link";
import { Wallet, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper bw-grain px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage-600 text-white mb-6">
        <Wallet size={22} />
      </div>
      <h1 className="font-display text-6xl font-semibold text-ink">404</h1>
      <p className="mt-3 text-ink-soft max-w-sm">
        Cette page n&apos;existe pas, ou a été déplacée. Vérifiez l&apos;adresse ou retournez
        à votre tableau de bord.
      </p>
      <Link
        href="/dashboard"
        className="mt-7 inline-flex items-center gap-2 rounded-lg bg-sage-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sage-700 transition-colors"
      >
        <ArrowLeft size={15} />
        Retour au tableau de bord
      </Link>
    </div>
  );
}
