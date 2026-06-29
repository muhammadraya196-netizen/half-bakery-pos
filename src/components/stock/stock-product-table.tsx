"use client";

import { Boxes } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StockStatusBadge } from "@/components/stock/stock-badges";
import type { ProductStockInfo } from "@/types";

interface StockProductTableProps {
  products: ProductStockInfo[];
  isLoading?: boolean;
}

export function StockProductTable({ products, isLoading }: StockProductTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Boxes className="h-10 w-10 text-muted-foreground" />
        <p className="font-medium">Belum ada data produk.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produk</TableHead>
          <TableHead>Kategori</TableHead>
          <TableHead className="text-center">Stok Saat Ini</TableHead>
          <TableHead className="text-center">Total Masuk</TableHead>
          <TableHead className="text-center">Total Keluar</TableHead>
          <TableHead className="text-center">Stok Minimum</TableHead>
          <TableHead className="text-center">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((p) => (
          <TableRow key={p.productId}>
            <TableCell className="font-medium">{p.name}</TableCell>
            <TableCell>
              <Badge variant="secondary">{p.category}</Badge>
            </TableCell>
            <TableCell className="text-center font-semibold">
              {p.currentStock}
            </TableCell>
            <TableCell className="text-center text-emerald-600">
              +{p.totalIn}
            </TableCell>
            <TableCell className="text-center text-red-600">
              -{p.totalOut}
            </TableCell>
            <TableCell className="text-center text-muted-foreground">
              {p.minStock}
            </TableCell>
            <TableCell className="text-center">
              <StockStatusBadge status={p.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
