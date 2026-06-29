import type { StockOutReason } from "@/types";

/** Ambang batas status stok (dipakai bila produk tidak punya minStock sendiri). */
export const DEFAULT_MIN_STOCK = 10;

export const SUPPLIERS = [
  "Supplier Tepung Makmur",
  "CV Mentega Sejahtera",
  "Coklat Nusantara",
  "Dairy Fresh Makassar",
  "Toko Bahan Kue Sentral",
  "Distributor Kopi Arabika",
] as const;

export const STOCK_UNITS = [
  "pcs",
  "box",
  "kg",
  "gram",
  "pack",
  "lusin",
  "liter",
] as const;

export const STOCK_OUT_REASONS: StockOutReason[] = [
  "Penjualan",
  "Produk Rusak",
  "Kadaluarsa",
  "Sampel",
  "Retur",
  "Lainnya",
];

export const STOCK_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
