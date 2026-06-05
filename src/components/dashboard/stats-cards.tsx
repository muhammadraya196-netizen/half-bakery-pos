"use client";

import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Package, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { AnalyticsData } from "@/types";

interface StatsCardsProps {
  data: AnalyticsData;
}

export function StatsCards({ data }: StatsCardsProps) {
  const stats = [
    {
      title: "Total Pendapatan",
      value: formatCurrency(data.totalRevenue),
      change: data.revenueGrowth,
      icon: DollarSign,
    },
    {
      title: "Total Pesanan",
      value: data.totalOrders.toString(),
      change: data.ordersGrowth,
      icon: ShoppingBag,
    },
    {
      title: "Total Produk",
      value: data.totalProducts.toString(),
      change: null,
      icon: Package,
    },
    {
      title: "Rata-rata Order",
      value: formatCurrency(data.averageOrderValue),
      change: null,
      icon: BarChart3,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isPositive = stat.change !== null && stat.change >= 0;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change !== null && (
                <p className={`flex items-center text-xs mt-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
                  {isPositive ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {isPositive ? "+" : ""}
                  {stat.change}% dari minggu lalu
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
