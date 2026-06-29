import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { salesApi } from "@/lib/api/sales-api";
import type { SalesQuery, SalesResult } from "@/types";

/**
 * Hook Daftar Penjualan.
 * Query key mencakup seluruh parameter (periode, startDate, endDate, search,
 * status, sort, limit, offset) sehingga refetch otomatis saat salah satu berubah.
 * keepPreviousData menjaga data lama tampil saat filter/halaman berpindah.
 */
export function useSales(query: SalesQuery) {
  return useQuery<SalesResult>({
    queryKey: ["sales", query],
    queryFn: () => salesApi.query(query),
    placeholderData: keepPreviousData,
  });
}
