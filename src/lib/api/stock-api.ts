import { api } from "@/lib/api";
import type {
  StockQuery,
  StockResult,
  StockOverview,
  StockMovement,
  StockMovementInput,
} from "@/types";

export function buildStockQueryString(query: StockQuery): string {
  const params = new URLSearchParams();

  if (query.startDate) params.set("startDate", query.startDate);
  if (query.endDate) params.set("endDate", query.endDate);
  if (query.search) params.set("search", query.search);
  if (query.productId && query.productId !== "all")
    params.set("productId", query.productId);
  if (query.supplier && query.supplier !== "all")
    params.set("supplier", query.supplier);
  if (query.type && query.type !== "all") params.set("type", query.type);
  if (typeof query.limit === "number") params.set("limit", String(query.limit));
  if (typeof query.offset === "number")
    params.set("offset", String(query.offset));

  return params.toString();
}

/** Stock API layer (terpisah dari hook & UI). */
export const stockApi = {
  movements(query: StockQuery): Promise<StockResult> {
    const qs = buildStockQueryString(query);
    return api.get<StockResult>(`/api/stock${qs ? `?${qs}` : ""}`);
  },

  overview(): Promise<StockOverview> {
    return api.get<StockOverview>("/api/stock/overview");
  },

  create(payload: StockMovementInput): Promise<StockMovement> {
    return api.post<StockMovement>("/api/stock", payload);
  },
};
