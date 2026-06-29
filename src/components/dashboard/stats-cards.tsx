"use client";

import { DollarSign, ShoppingBag, Package, BarChart3, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { AnalyticsData } from "@/types";

interface StatsCardsProps {
  data: AnalyticsData;
}

interface StatItem {
  title: string;
  value: string;
  icon: LucideIcon;
  /** Keterangan sumber data (selalu tampil di bagian bawah card) */
  source: string;
  /** Subtitle tambahan (opsional) */
  subtitle?: string;
  /** Pesan kondisi kosong (opsional) */
  emptyNote?: string;
}

export function StatsCards({ data }: StatsCardsProps) {
  const hasTransactionToday = data.todayOrderCount > 0;

  const stats: StatItem[] = [
    {
      // Total Penjualan Hari Ini = SUM(total transaksi pada tanggal hari ini)
      title: "Total Penjualan",
      value: formatCurrency(data.todaySales),
      icon: DollarSign,
      source: "Sumber data: seluruh transaksi pada hari ini.",
      emptyNote: hasTransactionToday ? undefined : "Belum ada transaksi hari ini",
    },
    {
      // Jumlah order pada tanggal hari ini
      title: "Total Pesanan",
      value: data.todayOrderCount.toString(),
      icon: ShoppingBag,
      source: "Sumber data: jumlah order hari ini.",
    },
    {
      // SUM(quantity) seluruh item pada transaksi hari ini
      title: "Produk Terjual",
      value: data.todayItemsSold.toString(),
      icon: Package,
      source: "Sumber data: seluruh item yang berhasil dijual hari ini.",
    },
    {
      // Rata-rata Penjualan = Total Penjualan Hari Ini / Jumlah transaksi hari ini
      title: "Rata-rata Penjualan",
      value: formatCurrency(data.todayAverageSale),
      icon: BarChart3,
      subtitle: "Berdasarkan transaksi yang terjadi hari ini.",
      source: "Total penjualan ÷ jumlah transaksi hari ini.",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
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
              {stat.emptyNote && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.emptyNote}
                </p>
              )}
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.subtitle}
                </p>
              )}
              <p className="mt-3 border-t pt-2 text-[11px] leading-snug text-muted-foreground/70">
                {stat.source}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
