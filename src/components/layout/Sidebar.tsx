"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  PiggyBank,
  ShieldCheck,
  Wallet,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/categories", label: "Catégories", icon: Tags },
  { href: "/budgets", label: "Budgets", icon: PiggyBank },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-line bg-paper-raised h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-600 text-white">
          <Wallet size={18} />
        </div>
        <span className="font-display text-xl font-semibold tracking-tight text-ink">
          BudgetWise
        </span>
      </div>

      <nav className="flex-1 px-3 py-2 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sage-600 text-white"
                  : "text-ink-soft hover:bg-sage-50 hover:text-ink"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}

        {user?.role === "admin" && (
          <>
            <div className="mt-4 mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-ink-soft/60">
              Administration
            </div>
            <Link
              href="/admin"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-sage-600 text-white"
                  : "text-ink-soft hover:bg-sage-50 hover:text-ink"
              )}
            >
              <ShieldCheck size={18} />
              Console admin
            </Link>
          </>
        )}
      </nav>

      <div className="border-t border-line px-3 py-4">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-sage-50 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-100 text-sm font-semibold text-sage-700">
            {user?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-ink">{user?.name}</span>
            <span className="truncate text-xs text-ink-soft">{user?.email}</span>
          </div>
        </Link>
        <button
          onClick={logout}
          className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-coral-50 hover:text-coral-600 transition-colors"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
