"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { SalesFilter } from "@/components/sales/sales-filter";
import { DateRangePicker } from "@/components/sales/date-range-picker";
import { SalesSummaryCards } from "@/components/sales/sales-summary-cards";
import { SalesTable } from "@/components/sales/sales-table";
import { ProductPagination } from "@/components/products/product-pagination";
import { useSales } from "@/hooks/use-sales";
import { useDebounce } from "@/hooks/use-debounce";
import { getPeriodRange } from "@/lib/services/sales-service";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type {
  Order,
  SalesPeriod,
  SalesQuery,
  SalesSortBy,
  SortDirection,
} from "@/types";

const DEFAULT_LIMIT = 10;

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  completed: "success",
  pending: "warning",
  cancelled: "destructive",
  refunded: "secondary",
};

const statusLabel: Record<string, string> = {
  completed: "Selesai",
  pending: "Pending",
  cancelled: "Dibatalkan",
  refunded: "Refund",
};

const paymentLabel: Record<string, string> = {
  cash: "Tunai",
  card: "E-Wallet",
  qris: "QRIS",
  transfer: "Transfer Bank",
};

export default function SalesPage() {
  // Judul browser (Page Title)
  useEffect(() => {
    const prev = document.title;
    document.title = "Daftar Penjualan | HALF Bakery POS";
    return () => {
      document.title = prev;
    };
  }, []);

  // ── Filter state ──
  const [period, setPeriod] = useState<SalesPeriod>("thisMonth");
  const [customRange, setCustomRange] = useState(() =>
    getPeriodRange("thisMonth")
  );
  const [status, setStatus] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SalesSortBy>("date");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const debouncedSearch = useDebounce(searchInput, 400);

  // Rentang tanggal efektif: dari preset, atau custom range bila period = custom.
  const range = useMemo(
    () =>
      period === "custom" ? customRange : getPeriodRange(period),
    [period, customRange]
  );

  // Reset ke halaman 1 setiap filter berubah.
  useEffect(() => {
    setPage(1);
  }, [period, customRange, status, debouncedSearch, limit, sortBy, sortDir]);

  const offset = (page - 1) * limit;

  const query: SalesQuery = useMemo(
    () => ({
      startDate: range.startDate,
      endDate: range.endDate,
      search: debouncedSearch || undefined,
      status,
      sortBy,
      sortDir,
      limit,
      offset,
    }),
    [range, debouncedSearch, status, sortBy, sortDir, limit, offset]
  );

  const { data, isLoading, isFetching, isPlaceholderData } = useSales(query);

  const orders = data?.data ?? [];
  const total = data?.total ?? 0;
  const summary = data?.summary ?? {
    totalSales: 0,
    transactionCount: 0,
    totalItemsSold: 0,
    averageTransaction: 0,
  };

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleSort = (column: SalesSortBy) => {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("desc");
    }
  };

  const isEmpty = !isLoading && total === 0;

  return (
    <>
      <Header
        title="Daftar Penjualan"
        description="Riwayat & ringkasan transaksi penjualan"
      />
      <div className="space-y-6 p-6">
        {/* Ringkasan mengikuti periode & filter aktif */}
        <SalesSummaryCards summary={summary} isLoading={isLoading} />

        <Card>
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle>Daftar Penjualan</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari no. transaksi / kasir / pelanggan..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full lg:w-80 pl-9"
                />
              </div>
            </div>

            <SalesFilter
              period={period}
              status={status}
              limit={limit}
              onPeriodChange={setPeriod}
              onStatusChange={setStatus}
              onLimitChange={setLimit}
            />

            {period === "custom" && (
              <DateRangePicker
                startDate={customRange.startDate}
                endDate={customRange.endDate}
                onChange={setCustomRange}
              />
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            <div
              className={cn(
                "transition-opacity duration-200",
                isPlaceholderData && isFetching && "opacity-60"
              )}
            >
              <SalesTable
                orders={orders}
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={handleSort}
                onViewDetail={setSelectedOrder}
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
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Penjualan</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">No. Transaksi</p>
                  <p className="font-medium">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={statusVariant[selectedOrder.status]}>
                    {statusLabel[selectedOrder.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Tanggal</p>
                  <p className="font-medium">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Kasir</p>
                  <p className="font-medium">{selectedOrder.cashierName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Pembayaran</p>
                  <p className="font-medium">{paymentLabel[selectedOrder.paymentMethod]}</p>
                </div>
                {selectedOrder.customerName && (
                  <div>
                    <p className="text-muted-foreground">Pelanggan</p>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                )}
              </div>

              {selectedOrder.notes && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Catatan</p>
                  <p className="font-medium">{selectedOrder.notes}</p>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <p className="font-medium text-sm">Item Penjualan</p>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>
                      {item.productName} x{item.quantity}
                    </span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pajak</span>
                  <span>{formatCurrency(selectedOrder.tax)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon</span>
                    <span>-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-1">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(selectedOrder.total)}</span>
                </div>
                {selectedOrder.paymentMethod === "cash" &&
                  selectedOrder.cashReceived !== undefined && (
                    <>
                      <div className="flex justify-between pt-1">
                        <span className="text-muted-foreground">Dibayar</span>
                        <span className="font-semibold">
                          {formatCurrency(selectedOrder.cashReceived)}
                        </span>
                      </div>
                      <div className="flex justify-between text-emerald-700">
                        <span className="font-medium">Kembalian</span>
                        <span className="font-bold">
                          {formatCurrency(selectedOrder.changeAmount ?? 0)}
                        </span>
                      </div>
                    </>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
