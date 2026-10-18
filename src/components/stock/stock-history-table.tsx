"use client";

import { History } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MovementTypeBadge } from "@/components/stock/stock-badges";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { StockMovement } from "@/types";

interface StockHistoryTableProps {
  movements: StockMovement[];
  isLoading?: boolean;
  isEmpty?: boolean;
}

export function StockHistoryTable({
  movements,
  isLoading,
  isEmpty,
}: StockHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <History className="h-10 w-10 text-muted-foreground" />
        <p className="font-medium">
          Tidak ada riwayat pergerakan stok pada filter yang dipilih.
        </p>
        <p className="text-sm text-muted-foreground">
          Coba ubah periode, jenis transaksi, atau kata kunci.
        </p>
      </div>
    );
  }

  return (
    <Table className="min-w-[72rem]">
      <TableHeader>
        <TableRow>
          <TableHead>Tanggal</TableHead>
          <TableHead>No. Transaksi</TableHead>
          <TableHead>Jenis</TableHead>
          <TableHead>Produk</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead className="text-right">Qty Masuk</TableHead>
          <TableHead className="text-right">Qty Keluar</TableHead>
          <TableHead className="text-right">Harga Beli</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="text-right">Stok</TableHead>
          <TableHead>Petugas</TableHead>
          <TableHead>Alasan / Keterangan</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((m) => (
          <TableRow key={m.id}>
            <TableCell className="whitespace-nowrap align-top text-sm text-muted-foreground">
              {formatDate(m.createdAt)}
            </TableCell>
            <TableCell className="whitespace-nowrap align-top font-mono text-xs">
              {m.transactionNumber}
            </TableCell>
            <TableCell className="align-top">
              <MovementTypeBadge type={m.type} />
            </TableCell>
            <TableCell className="min-w-[11rem] max-w-[16rem] whitespace-normal align-top">
              <p className="font-medium leading-snug">{m.productName}</p>
              {m.category ? (
                <p className="text-xs text-muted-foreground">{m.category}</p>
              ) : null}
            </TableCell>
            <TableCell className="min-w-[9rem] max-w-[14rem] whitespace-normal align-top text-sm text-muted-foreground">
              {m.supplier || "-"}
            </TableCell>
            <TableCell className="whitespace-nowrap align-top text-right font-medium tabular-nums text-emerald-600">
              {m.quantityIn > 0
                ? `+${m.quantityIn}${m.unit ? ` ${m.unit}` : ""}`
                : "-"}
            </TableCell>
            <TableCell className="whitespace-nowrap align-top text-right font-medium tabular-nums text-red-600">
              {m.quantityOut > 0
                ? `-${m.quantityOut}${m.unit ? ` ${m.unit}` : ""}`
                : "-"}
            </TableCell>
            <TableCell className="whitespace-nowrap align-top text-right tabular-nums">
              {m.purchasePrice !== undefined
                ? formatCurrency(m.purchasePrice)
                : "-"}
            </TableCell>
            <TableCell className="whitespace-nowrap align-top text-right font-medium tabular-nums">
              {m.totalPrice !== undefined ? formatCurrency(m.totalPrice) : "-"}
            </TableCell>
            <TableCell className="whitespace-nowrap align-top text-right tabular-nums">
              <span className="text-muted-foreground">{m.stockBefore}</span>
              <span className="px-1 text-muted-foreground">→</span>
              <span className="font-semibold">{m.stockAfter}</span>
            </TableCell>
            <TableCell className="whitespace-nowrap align-top text-sm">
              {m.officerName}
            </TableCell>
            <TableCell className="min-w-[8rem] max-w-[14rem] whitespace-normal align-top text-sm">
              {m.reason ? (
                <p className="font-medium leading-snug">{m.reason}</p>
              ) : null}
              {m.note ? (
                <p className="leading-snug text-muted-foreground">{m.note}</p>
              ) : null}
              {!m.reason && !m.note ? (
                <span className="text-muted-foreground">-</span>
              ) : null}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
