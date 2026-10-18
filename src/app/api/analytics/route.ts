import { NextResponse } from "next/server";
import { mockAnalytics } from "@/lib/mock-data";
import { getDashboardStats } from "@/lib/db";
import type { AnalyticsData } from "@/types";

// Selalu hitung ulang (realtime) setiap dashboard meminta data.
export const dynamic = "force-dynamic";

export async function GET() {
  const stats = await getDashboardStats();

  const analytics: AnalyticsData = {
    // salesByDay / salesByCategory / topProducts dipakai chart (di luar revisi)
    ...mockAnalytics,
    totalRevenue: stats.totalRevenue,
    totalOrders: stats.totalOrders,
    totalProducts: stats.totalProducts,
    averageOrderValue:
      stats.completedOrders > 0 ? stats.totalRevenue / stats.completedOrders : 0,
    todaySales: stats.todaySales,
    todayOrderCount: stats.todayOrderCount,
    todayItemsSold: stats.todayItemsSold,
    todayAverageSale:
      stats.todayOrderCount > 0 ? stats.todaySales / stats.todayOrderCount : 0,
  };

  return NextResponse.json(analytics);
}
