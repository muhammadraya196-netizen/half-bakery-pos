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
import { formatDate } from "@/lib/utils";
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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>No. Transaksi</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead className="text-center">Qty Masuk</TableHead>
            <TableHead className="text-center">Qty Keluar</TableHead>
            <TableHead className="text-center">Stok Sebelum</TableHead>
            <TableHead className="text-center">Stok Sesudah</TableHead>
            <TableHead>Petugas</TableHead>
            <TableHead>Keterangan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                {formatDate(m.createdAt)}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {m.transactionNumber}
              </TableCell>
              <TableCell>
                <MovementTypeBadge type={m.type} />
              </TableCell>
              <TableCell className="font-medium">{m.productName}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {m.supplier || "-"}
              </TableCell>
              <TableCell className="text-center text-emerald-600 font-medium">
                {m.quantityIn > 0 ? `+${m.quantityIn}` : "-"}
              </TableCell>
              <TableCell className="text-center text-red-600 font-medium">
                {m.quantityOut > 0 ? `-${m.quantityOut}` : "-"}
              </TableCell>
              <TableCell className="text-center">{m.stockBefore}</TableCell>
              <TableCell className="text-center font-semibold">
                {m.stockAfter}
              </TableCell>
              <TableCell className="text-sm">{m.officerName}</TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                {m.reason ? `${m.reason}` : ""}
                {m.reason && m.note ? " · " : ""}
                {m.note || (!m.reason ? "-" : "")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
