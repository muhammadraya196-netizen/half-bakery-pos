import { api } from "@/lib/api";
import type { SalesQuery, SalesResult } from "@/types";

/** Bangun query string dari SalesQuery (hanya field terisi). */
export function buildSalesQueryString(query: SalesQuery): string {
  const params = new URLSearchParams();

  if (query.startDate) params.set("startDate", query.startDate);
  if (query.endDate) params.set("endDate", query.endDate);
  if (query.search) params.set("search", query.search);
  if (query.status && query.status !== "all")
    params.set("status", query.status);
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.sortDir) params.set("sortDir", query.sortDir);
  if (typeof query.limit === "number") params.set("limit", String(query.limit));
  if (typeof query.offset === "number")
    params.set("offset", String(query.offset));

  return params.toString();
}

/**
 * Sales API (terpisah dari hook & komponen UI).
 * Endpoint backend tetap /api/orders (data transaksi yang sama).
 */
export const salesApi = {
  /** Ambil daftar penjualan terpaginasi + ringkasan (wajib menyertakan limit). */
  query(query: SalesQuery): Promise<SalesResult> {
    const qs = buildSalesQueryString(query);
    return api.get<SalesResult>(`/api/orders${qs ? `?${qs}` : ""}`);
  },
};
