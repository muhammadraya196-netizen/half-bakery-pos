"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DateRangePicker } from "@/components/sales/date-range-picker";
import { SUPPLIERS, STOCK_PAGE_SIZE_OPTIONS } from "@/lib/stock-data";
import type { Product, StockMovementType } from "@/types";

export type StockPeriod = "today" | "thisWeek" | "thisMonth" | "custom";

const PERIOD_OPTIONS: { value: StockPeriod; label: string }[] = [
  { value: "today", label: "Hari Ini" },
  { value: "thisWeek", label: "Minggu Ini" },
  { value: "thisMonth", label: "Bulan Ini" },
  { value: "custom", label: "Custom Range" },
];

interface StockFilterProps {
  period: StockPeriod;
  type: StockMovementType | "all";
  productId: string;
  supplier: string;
  limit: number;
  customRange: { startDate: string; endDate: string };
  products: Product[];
  onPeriodChange: (value: StockPeriod) => void;
  onTypeChange: (value: StockMovementType | "all") => void;
  onProductChange: (value: string) => void;
  onSupplierChange: (value: string) => void;
  onLimitChange: (value: number) => void;
  onCustomRangeChange: (range: { startDate: string; endDate: string }) => void;
}

export function StockFilter(props: StockFilterProps) {
  const {
    period,
    type,
    productId,
    supplier,
    limit,
    customRange,
    products,
    onPeriodChange,
    onTypeChange,
    onProductChange,
    onSupplierChange,
    onLimitChange,
    onCustomRangeChange,
  } = props;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Periode</Label>
          <Select value={period} onValueChange={(v) => onPeriodChange(v as StockPeriod)}>
            <SelectTrigger className="h-9 w-40 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Jenis Transaksi</Label>
          <Select
            value={type}
            onValueChange={(v) => onTypeChange(v as StockMovementType | "all")}
          >
            <SelectTrigger className="h-9 w-36 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="in">Stok Masuk</SelectItem>
              <SelectItem value="out">Stok Keluar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Produk</Label>
          <Select value={productId} onValueChange={onProductChange}>
            <SelectTrigger className="h-9 w-48 text-sm">
              <SelectValue placeholder="Semua produk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Produk</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Supplier</Label>
          <Select value={supplier} onValueChange={onSupplierChange}>
            <SelectTrigger className="h-9 w-48 text-sm">
              <SelectValue placeholder="Semua supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Supplier</SelectItem>
              {SUPPLIERS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Per halaman</Label>
          <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
            <SelectTrigger className="h-9 w-24 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STOCK_PAGE_SIZE_OPTIONS.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {period === "custom" && (
        <DateRangePicker
          startDate={customRange.startDate}
          endDate={customRange.endDate}
          onChange={onCustomRangeChange}
        />
      )}
    </div>
  );
}
