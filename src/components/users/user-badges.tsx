"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { UserRole, UserStatus } from "@/types";

const roleConfig: Record<UserRole, { label: string; className: string }> = {
  admin: { label: "🟥 Admin", className: "bg-red-100 text-red-800 border-transparent" },
  finance: { label: "🟦 Finance", className: "bg-blue-100 text-blue-800 border-transparent" },
  cashier: { label: "🟩 Cashier", className: "bg-green-100 text-green-800 border-transparent" },
  manager: { label: "Manager", className: "bg-purple-100 text-purple-800 border-transparent" },
};

export function RoleBadge({ role }: { role: UserRole }) {
  const cfg = roleConfig[role] ?? roleConfig.cashier;
  return <Badge className={cn(cfg.className, "hover:opacity-90")}>{cfg.label}</Badge>;
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return status === "active" ? (
    <Badge variant="success">Aktif</Badge>
  ) : (
    <Badge variant="destructive">Nonaktif</Badge>
  );
}
