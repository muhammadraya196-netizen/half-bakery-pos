"use client";

import { Badge } from "@/components/ui/badge";
import type { StockMovementType, StockStatus } from "@/types";

/** Badge jenis transaksi: hijau = masuk, merah = keluar. */
export function MovementTypeBadge({ type }: { type: StockMovementType }) {
  return type === "in" ? (
    <Badge variant="success">Stok Masuk</Badge>
  ) : (
    <Badge variant="destructive">Stok Keluar</Badge>
  );
}

const statusConfig: Record<
  StockStatus,
  { label: string; variant: "success" | "warning" | "destructive" }
> = {
  safe: { label: "🟢 Aman", variant: "success" },
  low: { label: "🟡 Hampir Habis", variant: "warning" },
  out: { label: "🔴 Habis", variant: "destructive" },
};

export function StockStatusBadge({ status }: { status: StockStatus }) {
  const cfg = statusConfig[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
