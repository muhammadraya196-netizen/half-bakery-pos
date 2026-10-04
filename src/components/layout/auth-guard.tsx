"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/session-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      // Simpan tujuan awal (termasuk query, mis. ?promo=...) agar setelah
      // login pengguna kembali ke halaman yang tadi diminta.
      const target = window.location.pathname + window.location.search;
      const redirect =
        target && target !== "/login"
          ? `?redirect=${encodeURIComponent(target)}`
          : "";
      router.replace(`/login${redirect}`);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
