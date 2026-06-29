"use client";

import { SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BAKERY_CATEGORIES } from "@/lib/bakery-data";
import type { ProductStatus } from "@/types";

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

interface ProductFiltersProps {
  category: string;
  status: ProductStatus;
  limit: number;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: ProductStatus) => void;
  onLimitChange: (value: number) => void;
}

export function ProductFilters({
  category,
  status,
  limit,
  onCategoryChange,
  onStatusChange,
  onLimitChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <SlidersHorizontal className="h-4 w-4" />
        <span className="font-medium">Filter</span>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Kategori</Label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="h-9 w-40 text-sm">
            <SelectValue placeholder="Semua kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kategori</SelectItem>
            {BAKERY_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Status</Label>
        <Select
          value={status}
          onValueChange={(v) => onStatusChange(v as ProductStatus)}
        >
          <SelectTrigger className="h-9 w-36 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="active">Aktif (ada stok)</SelectItem>
            <SelectItem value="inactive">Nonaktif (stok habis)</SelectItem>
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
            {PAGE_SIZE_OPTIONS.map((size) => (
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
