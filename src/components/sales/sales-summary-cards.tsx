"use client";

import { DollarSign, Receipt, Package, TrendingUp, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { SalesSummary } from "@/types";

interface SalesSummaryCardsProps {
  summary: SalesSummary;
  isLoading?: boolean;
}

export function SalesSummaryCards({ summary, isLoading }: SalesSummaryCardsProps) {
  const cards: { title: string; value: string; icon: LucideIcon }[] = [
    {
      title: "Total Penjualan",
      value: formatCurrency(summary.totalSales),
      icon: DollarSign,
    },
    {
      title: "Jumlah Transaksi",
      value: summary.transactionCount.toString(),
      icon: Receipt,
    },
    {
      title: "Total Produk Terjual",
      value: summary.totalItemsSold.toString(),
      icon: Package,
    },
    {
      title: "Rata-rata Nilai Transaksi",
      value: formatCurrency(summary.averageTransaction),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-7 w-24 animate-pulse rounded bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
              <p className="mt-2 text-[11px] leading-snug text-muted-foreground/70">
                Mengikuti periode &amp; filter aktif
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
