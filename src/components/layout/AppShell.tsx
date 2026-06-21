"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { NotificationBell } from "./NotificationBell";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Wallet } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-paper bw-grain">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between border-b border-line bg-paper-raised/80 backdrop-blur px-4 sm:px-6 py-3 sticky top-0 z-30">
          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sage-600 text-white">
              <Wallet size={16} />
            </div>
            <span className="font-display text-lg font-semibold text-ink">BudgetWise</span>
          </Link>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-sm text-ink-soft">
              Bonjour, <span className="font-medium text-ink">{user?.name?.split(" ")[0]}</span>
            </span>
            <NotificationBell />
          </div>
        </header>
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
