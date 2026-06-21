import Link from "next/link";
import {
  Wallet,
  ArrowRight,
  PiggyBank,
  BellRing,
  BarChart3,
  ShieldCheck,
  Smartphone,
  Check,
} from "lucide-react";

const TICKER_ITEMS = [
  { label: "Alimentation", value: "−42 500" },
  { label: "Salaire", value: "+450 000" },
  { label: "Transport", value: "−18 200" },
  { label: "Épargne", value: "+75 000" },
  { label: "Loisirs", value: "−12 000" },
  { label: "Factures", value: "−31 400" },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: "Vue d'ensemble claire",
    desc: "Graphiques de tendance, répartition par catégorie et solde net mis à jour en temps réel.",
  },
  {
    icon: PiggyBank,
    title: "Budgets par catégorie",
    desc: "Fixez une limite mensuelle globale ou par poste de dépense et suivez votre progression.",
  },
  {
    icon: BellRing,
    title: "Alertes intelligentes",
    desc: "Une notification dès que vous approchez ou dépassez un seuil de dépense, sans avoir à vérifier.",
  },
  {
    icon: ShieldCheck,
    title: "Données protégées",
    desc: "Mots de passe hachés, sessions sécurisées par JWT, accès strictement limité à votre compte.",
  },
  {
    icon: Smartphone,
    title: "Pensé pour le mobile",
    desc: "Ajoutez une dépense en quelques secondes, où que vous soyez, sur tout appareil.",
  },
  {
    icon: Wallet,
    title: "Multi-devises",
    desc: "Suivez votre budget dans la devise de votre choix : XOF, EUR, USD et plus.",
  },
];

export default function LandingPage() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="flex flex-col min-h-screen bg-paper bw-grain">
      <header className="flex items-center justify-between px-5 sm:px-8 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-600 text-white">
            <Wallet size={18} />
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">BudgetWise</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="px-3 sm:px-4 py-2 text-sm font-medium text-ink-soft hover:text-ink transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="px-3 sm:px-4 py-2 rounded-lg bg-sage-600 text-white text-sm font-medium hover:bg-sage-700 transition-colors shadow-sm"
          >
            Créer un compte
          </Link>
        </div>
      </header>

      <section className="px-5 sm:px-8 pt-10 sm:pt-16 pb-12 max-w-6xl mx-auto w-full">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full bg-sage-100 px-3 py-1 text-xs font-medium text-sage-700 mb-6">
            Gestion de budget personnel
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold leading-[1.05] tracking-tight text-ink">
            Sachez où va{" "}
            <span className="italic text-sage-600">chaque franc</span>, avant la fin du mois.
          </h1>
          <p className="mt-6 text-lg text-ink-soft leading-relaxed max-w-xl">
            BudgetWise transforme vos relevés de dépenses en décisions financières claires :
            suivi en temps réel, budgets par catégorie, et alertes avant le dépassement —
            pas après.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-sage-600 px-6 py-3.5 text-sm font-medium text-white hover:bg-sage-700 transition-colors shadow-sm"
            >
              Commencer gratuitement
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-paper-raised px-6 py-3.5 text-sm font-medium text-ink hover:bg-sage-50 transition-colors"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>
          <div className="mt-6 flex items-center gap-1.5 text-xs text-ink-soft">
            <Check size={14} className="text-sage-600" />
            Aucune carte bancaire requise · Configuration en moins de 2 minutes
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-line bg-sage-900 text-white">
        <div className="flex w-max bw-ticker-track">
          {doubled.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2 whitespace-nowrap px-6 py-3 text-xs font-mono bw-tabular border-r border-white/10"
            >
              <span className="text-white/50 uppercase tracking-wider">{item.label}</span>
              <span
                className={
                  item.value.startsWith("+")
                    ? "text-sage-300 font-semibold"
                    : "text-coral-400 font-semibold"
                }
              >
                {item.value} XOF
              </span>
            </div>
          ))}
        </div>
      </div>

      <section className="px-5 sm:px-8 py-16 sm:py-20 max-w-6xl mx-auto w-full">
        <div className="max-w-xl mb-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Tout ce qu&apos;il faut pour reprendre la main
          </h2>
          <p className="mt-3 text-ink-soft leading-relaxed">
            Une suite complète d&apos;outils pensés pour la clarté, pas pour vous noyer sous les chiffres.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="rounded-2xl border border-line bg-paper-raised p-6 hover:border-sage-300 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sage-100 text-sage-700 mb-4">
                  <Icon size={19} />
                </div>
                <h3 className="font-display text-base font-semibold text-ink mb-1.5">
                  {f.title}
                </h3>
                <p className="text-sm text-ink-soft leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-5 sm:px-8 pb-20 max-w-6xl mx-auto w-full">
        <div className="rounded-3xl bg-sage-900 text-white px-8 py-14 sm:px-14 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            Votre budget mérite mieux qu&apos;un carnet.
          </h2>
          <p className="mt-3 text-sage-100/80 max-w-md mx-auto">
            Créez votre compte et ajoutez votre première transaction en moins de deux minutes.
          </p>
          <Link
            href="/register"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white text-sage-900 px-7 py-3.5 text-sm font-semibold hover:bg-sage-50 transition-colors"
          >
            Créer mon compte gratuit
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="px-5 sm:px-8 py-8 max-w-6xl mx-auto w-full text-center text-xs text-ink-soft border-t border-line">
        BudgetWise — Projet académique de système web cloud-native. Démonstration uniquement.
      </footer>
    </div>
  );
}
