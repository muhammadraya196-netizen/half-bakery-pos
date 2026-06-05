"use client";

import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { RecentOrders } from "@/components/dashboard/recent-orders";
import { TopProducts } from "@/components/dashboard/top-products";
import { useAnalytics } from "@/hooks/use-analytics";
import { useOrders } from "@/hooks/use-orders";

export default function DashboardPage() {
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: orders, isLoading: ordersLoading } = useOrders();

  if (analyticsLoading) {
    return (
      <>
        <Header title="Dashboard" description="Ringkasan bisnis Anda" />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </>
    );
  }

  if (!analytics) return null;

  return (
    <>
      <Header title="Dashboard" description="Ringkasan bisnis Anda" />
      <div className="space-y-6 p-6">
        <StatsCards data={analytics} />
        <div className="grid gap-6 lg:grid-cols-3">
          <SalesChart data={analytics} />
          <TopProducts products={analytics.topProducts} />
        </div>
        <RecentOrders orders={orders || []} />
        {ordersLoading && (
          <p className="text-sm text-muted-foreground text-center">Memuat pesanan...</p>
        )}
      </div>
    </>
  );
}
