import { NextResponse } from "next/server";
import { mockAnalytics } from "@/lib/mock-data";
import { getOrders, getProducts } from "@/lib/db";
import { computeDailySalesStats } from "@/lib/analytics-helpers";
import type { AnalyticsData } from "@/types";

// Selalu hitung ulang (realtime) setiap dashboard meminta data.
export const dynamic = "force-dynamic";

export async function GET() {
  const orders = getOrders();
  const products = getProducts();

  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

  // Metrik kartu dashboard dihitung penuh dari transaksi nyata hari ini.
  const daily = computeDailySalesStats(orders);

  const analytics: AnalyticsData = {
    // salesByDay / salesByCategory / topProducts dipakai chart (di luar revisi)
    ...mockAnalytics,
    totalRevenue,
    totalOrders: orders.length,
    totalProducts: products.length,
    averageOrderValue:
      completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
    todaySales: daily.todaySales,
    todayOrderCount: daily.todayOrderCount,
    todayItemsSold: daily.todayItemsSold,
    todayAverageSale: daily.todayAverageSale,
  };

  return NextResponse.json(analytics);
}
