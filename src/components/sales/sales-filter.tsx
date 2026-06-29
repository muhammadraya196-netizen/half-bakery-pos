"use client";

import { CalendarRange } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { SalesPeriod } from "@/types";

export const PERIOD_OPTIONS: { value: SalesPeriod; label: string }[] = [
  { value: "today", label: "Hari Ini" },
  { value: "yesterday", label: "Kemarin" },
  { value: "last7days", label: "7 Hari Terakhir" },
  { value: "thisWeek", label: "Minggu Ini" },
  { value: "thisMonth", label: "Bulan Ini" },
  { value: "lastMonth", label: "Bulan Lalu" },
  { value: "thisYear", label: "Tahun Ini" },
  { value: "custom", label: "Custom Range" },
];

export const SALES_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

const STATUS_OPTIONS = [
  { value: "all", label: "Semua Status" },
  { value: "completed", label: "Selesai" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Dibatalkan" },
];

interface SalesFilterProps {
  period: SalesPeriod;
  status: string;
  limit: number;
  onPeriodChange: (value: SalesPeriod) => void;
  onStatusChange: (value: string) => void;
  onLimitChange: (value: number) => void;
}

export function SalesFilter({
  period,
  status,
  limit,
  onPeriodChange,
  onStatusChange,
  onLimitChange,
}: SalesFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <CalendarRange className="h-4 w-4" />
        <span className="font-medium">Periode</span>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Periode Penjualan</Label>
        <Select
          value={period}
          onValueChange={(v) => onPeriodChange(v as SalesPeriod)}
        >
          <SelectTrigger className="h-9 w-44 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Status</Label>
        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="h-9 w-36 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Per halaman</Label>
        <Select
          value={String(limit)}
          onValueChange={(v) => onLimitChange(Number(v))}
        >
          <SelectTrigger className="h-9 w-24 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SALES_PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
