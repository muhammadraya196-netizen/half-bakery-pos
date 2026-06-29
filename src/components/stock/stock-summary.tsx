"use client";

import {
  Package,
  Boxes,
  PackagePlus,
  PackageMinus,
  AlertTriangle,
  PackageX,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StockSummary } from "@/types";
import { cn } from "@/lib/utils";

interface StockSummaryCardsProps {
  summary: StockSummary;
  isLoading?: boolean;
}

export function StockSummaryCards({ summary, isLoading }: StockSummaryCardsProps) {
  const cards: {
    title: string;
    value: number;
    icon: LucideIcon;
    accent?: string;
  }[] = [
    { title: "Total Produk", value: summary.totalProducts, icon: Package },
    { title: "Total Stok Saat Ini", value: summary.totalStock, icon: Boxes },
    {
      title: "Stok Masuk Hari Ini",
      value: summary.totalStockInToday,
      icon: PackagePlus,
      accent: "text-emerald-600",
    },
    {
      title: "Stok Keluar Hari Ini",
      value: summary.totalStockOutToday,
      icon: PackageMinus,
      accent: "text-red-600",
    },
    {
      title: "Produk Hampir Habis",
      value: summary.lowStockCount,
      icon: AlertTriangle,
      accent: "text-yellow-600",
    },
    {
      title: "Produk Habis",
      value: summary.outOfStockCount,
      icon: PackageX,
      accent: "text-red-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className={cn("h-4 w-4 text-muted-foreground", card.accent)} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-7 w-16 animate-pulse rounded bg-muted" />
              ) : (
                <div className={cn("text-2xl font-bold", card.accent)}>
                  {card.value}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
