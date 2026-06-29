import { api } from "@/lib/api";
import type { Product, ProductQuery, PaginatedResponse } from "@/types";

/** Bangun query string dari ProductQuery (hanya field yang terisi). */
export function buildProductQueryString(query: ProductQuery): string {
  const params = new URLSearchParams();

  if (query.search) params.set("search", query.search);
  if (query.category && query.category !== "all")
    params.set("category", query.category);
  if (query.status && query.status !== "all")
    params.set("status", query.status);
  if (typeof query.minPrice === "number")
    params.set("minPrice", String(query.minPrice));
  if (typeof query.maxPrice === "number")
    params.set("maxPrice", String(query.maxPrice));
  if (typeof query.minStock === "number")
    params.set("minStock", String(query.minStock));
  if (typeof query.limit === "number") params.set("limit", String(query.limit));
  if (typeof query.offset === "number")
    params.set("offset", String(query.offset));

  return params.toString();
}

/**
 * Layer Product API (terpisah dari hook & komponen UI).
 */
export const productApi = {
  /** List penuh (array) — kompatibel dengan pemakaian lama (POS, menu). */
  list(query: ProductQuery = {}): Promise<Product[]> {
    const qs = buildProductQueryString({ ...query, limit: undefined, offset: undefined });
    return api.get<Product[]>(`/api/products${qs ? `?${qs}` : ""}`);
  },

  /** List paginasi (envelope) — wajib menyertakan limit. */
  paginated(query: ProductQuery): Promise<PaginatedResponse<Product>> {
    const qs = buildProductQueryString(query);
    return api.get<PaginatedResponse<Product>>(
      `/api/products${qs ? `?${qs}` : ""}`
    );
  },
};
