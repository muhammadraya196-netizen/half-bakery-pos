"use client";

import { ArrowUp, ArrowDown, ArrowUpDown, Inbox } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Order, SalesSortBy, SortDirection } from "@/types";

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  completed: "success",
  pending: "warning",
  cancelled: "destructive",
  refunded: "secondary",
};

const statusLabel: Record<string, string> = {
  completed: "Selesai",
  pending: "Pending",
  cancelled: "Dibatalkan",
  refunded: "Refund",
};

const paymentLabel: Record<string, string> = {
  cash: "Tunai",
  card: "E-Wallet",
  qris: "QRIS",
  transfer: "Transfer Bank",
};

function itemCount(order: Order): number {
  return order.items.reduce((sum, i) => sum + i.quantity, 0);
}

interface SalesTableProps {
  orders: Order[];
  sortBy: SalesSortBy;
  sortDir: SortDirection;
  onSort: (column: SalesSortBy) => void;
  onViewDetail: (order: Order) => void;
  isLoading?: boolean;
  isEmpty?: boolean;
}

export function SalesTable({
  orders,
  sortBy,
  sortDir,
  onSort,
  onViewDetail,
  isLoading,
  isEmpty,
}: SalesTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground" />
        <p className="font-medium">
          Tidak ada data penjualan pada periode yang dipilih.
        </p>
        <p className="text-sm text-muted-foreground">
          Coba ubah periode, status, atau kata kunci pencarian.
        </p>
      </div>
    );
  }

  const SortIcon = ({ column }: { column: SalesSortBy }) => {
    if (sortBy !== column)
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-50" />;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="ml-1 h-3.5 w-3.5" />
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>No. Transaksi</TableHead>
          <TableHead>
            <button
              type="button"
              onClick={() => onSort("date")}
              className={cn(
                "flex items-center font-medium transition-colors hover:text-primary",
                sortBy === "date" && "text-primary"
              )}
            >
              Tanggal
              <SortIcon column="date" />
            </button>
          </TableHead>
          <TableHead>Kasir</TableHead>
          <TableHead className="text-center">Jumlah Item</TableHead>
          <TableHead>Pembayaran</TableHead>
          <TableHead className="text-right">
            <button
              type="button"
              onClick={() => onSort("total")}
              className={cn(
                "ml-auto flex items-center font-medium transition-colors hover:text-primary",
                sortBy === "total" && "text-primary"
              )}
            >
              Total Penjualan
              <SortIcon column="total" />
            </button>
          </TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">{order.orderNumber}</TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatDate(order.createdAt)}
            </TableCell>
            <TableCell>{order.cashierName}</TableCell>
            <TableCell className="text-center">{itemCount(order)}</TableCell>
            <TableCell>{paymentLabel[order.paymentMethod]}</TableCell>
            <TableCell className="text-right font-semibold">
              {formatCurrency(order.total)}
            </TableCell>
            <TableCell>
              <Badge variant={statusVariant[order.status]}>
                {statusLabel[order.status]}
              </Badge>
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetail(order)}
              >
                Detail
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
