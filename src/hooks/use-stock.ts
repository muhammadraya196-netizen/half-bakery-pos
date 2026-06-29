import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { stockApi } from "@/lib/api/stock-api";
import type { StockQuery, StockResult, StockOverview } from "@/types";

/** Riwayat pergerakan stok (filter + pagination). */
export function useStockMovements(query: StockQuery) {
  return useQuery<StockResult>({
    queryKey: ["stock", "movements", query],
    queryFn: () => stockApi.movements(query),
    placeholderData: keepPreviousData,
  });
}

/** Ringkasan & info stok per produk (Dashboard Stok). */
export function useStockOverview() {
  return useQuery<StockOverview>({
    queryKey: ["stock", "overview"],
    queryFn: () => stockApi.overview(),
    refetchInterval: 30000,
  });
}

/** Mutasi pembuatan pergerakan stok (masuk / keluar). */
export function useCreateStockMovement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: stockApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
