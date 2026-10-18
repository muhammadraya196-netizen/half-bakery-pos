"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSessionStore } from "@/stores/session-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const hasHydrated = useSessionStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    if (isAuthenticated) return;

    // Akses langsung ke dashboard/POS tanpa login → paksa ke halaman login.
    const search = searchParams.toString();
    const target = `${pathname}${search ? `?${search}` : ""}`;
    const redirect =
      target && target !== "/login"
        ? `?redirect=${encodeURIComponent(target)}`
        : "";
    router.replace(`/login${redirect}`);
  }, [hasHydrated, isAuthenticated, pathname, router, searchParams]);

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
