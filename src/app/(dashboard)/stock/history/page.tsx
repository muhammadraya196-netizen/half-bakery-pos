"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StockFilter, type StockPeriod } from "@/components/stock/stock-filter";
import { StockHistoryTable } from "@/components/stock/stock-history-table";
import { ProductPagination } from "@/components/products/product-pagination";
import { useStockMovements } from "@/hooks/use-stock";
import { useProducts } from "@/hooks/use-products";
import { useDebounce } from "@/hooks/use-debounce";
import { getPeriodRange } from "@/lib/services/sales-service";
import { cn } from "@/lib/utils";
import type { StockMovementType, StockQuery } from "@/types";

const DEFAULT_LIMIT = 10;

export default function StockHistoryPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Riwayat Pergerakan Stok | HALF Bakery POS";
    return () => {
      document.title = prev;
    };
  }, []);

  const { data: products } = useProducts();

  const [period, setPeriod] = useState<StockPeriod>("thisMonth");
  const [customRange, setCustomRange] = useState(() => getPeriodRange("thisMonth"));
  const [type, setType] = useState<StockMovementType | "all">("all");
  const [productId, setProductId] = useState("all");
  const [supplier, setSupplier] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchInput, 400);

  const range = useMemo(
    () => (period === "custom" ? customRange : getPeriodRange(period)),
    [period, customRange]
  );

  useEffect(() => {
    setPage(1);
  }, [period, customRange, type, productId, supplier, debouncedSearch, limit]);

  const offset = (page - 1) * limit;

  const query: StockQuery = useMemo(
    () => ({
      startDate: range.startDate,
      endDate: range.endDate,
      type,
      productId,
      supplier,
      search: debouncedSearch || undefined,
      limit,
      offset,
    }),
    [range, type, productId, supplier, debouncedSearch, limit, offset]
  );

  const { data, isLoading, isFetching, isPlaceholderData } =
    useStockMovements(query);

  const movements = data?.data ?? [];
  const total = data?.total ?? 0;
  const isEmpty = !isLoading && total === 0;

  return (
    <>
      <Header
        title="Riwayat Pergerakan Stok"
        description="Seluruh histori stok masuk & keluar (audit log)"
      />
      <div className="min-w-0 space-y-6 p-6">
        <Card className="min-w-0">
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle>Riwayat Pergerakan Stok</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari produk / no. transaksi / supplier..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full lg:w-80 pl-9"
                />
              </div>
            </div>

            <StockFilter
              period={period}
              type={type}
              productId={productId}
              supplier={supplier}
              limit={limit}
              customRange={customRange}
              products={products ?? []}
              onPeriodChange={setPeriod}
              onTypeChange={setType}
              onProductChange={setProductId}
              onSupplierChange={setSupplier}
              onLimitChange={setLimit}
              onCustomRangeChange={setCustomRange}
            />
          </CardHeader>

          <CardContent className="min-w-0 space-y-4">
            <div
              className={cn(
                "transition-opacity duration-200",
                isPlaceholderData && isFetching && "opacity-60"
              )}
            >
              <StockHistoryTable
                movements={movements}
                isLoading={isLoading}
                isEmpty={isEmpty}
              />
            </div>

            {!isLoading && total > 0 && (
              <ProductPagination
                total={total}
                limit={limit}
                offset={offset}
                currentPage={page}
                onPageChange={setPage}
                itemLabel="transaksi"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
