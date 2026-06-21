"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    } else if (!loading && adminOnly && user?.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [loading, user, adminOnly, router]);

  if (loading || !user || (adminOnly && user.role !== "admin")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-sage-300 border-t-sage-600" />
          <p className="text-sm text-ink-soft">Chargement...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
