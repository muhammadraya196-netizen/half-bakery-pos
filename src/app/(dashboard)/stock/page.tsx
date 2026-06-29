"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PackagePlus, PackageMinus, History } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockSummaryCards } from "@/components/stock/stock-summary";
import { StockProductTable } from "@/components/stock/stock-product-table";
import { useStockOverview } from "@/hooks/use-stock";

const EMPTY_SUMMARY = {
  totalProducts: 0,
  totalStock: 0,
  totalStockInToday: 0,
  totalStockOutToday: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
};

export default function StockDashboardPage() {
  useEffect(() => {
    const prev = document.title;
    document.title = "Dashboard Stok | HALF Bakery POS";
    return () => {
      document.title = prev;
    };
  }, []);

  const { data, isLoading } = useStockOverview();

  const summary = data?.summary ?? EMPTY_SUMMARY;
  const products = data?.products ?? [];

  return (
    <>
      <Header title="Dashboard Stok" description="Ringkasan & status stok produk realtime" />
      <div className="space-y-6 p-6">
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/stock/in">
              <PackagePlus className="h-4 w-4 mr-1.5" />
              Stok Masuk
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/stock/out">
              <PackageMinus className="h-4 w-4 mr-1.5" />
              Stok Keluar
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/stock/history">
              <History className="h-4 w-4 mr-1.5" />
              Riwayat Pergerakan
            </Link>
          </Button>
        </div>

        <StockSummaryCards summary={summary} isLoading={isLoading} />

        <Card>
          <CardHeader>
            <CardTitle>Dashboard Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <StockProductTable products={products} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
