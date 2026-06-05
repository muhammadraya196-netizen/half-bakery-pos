import { NextResponse } from "next/server";
import { mockAnalytics } from "@/lib/mock-data";
import { getOrders, getProducts } from "@/lib/db";

export async function GET() {
  const orders = getOrders();
  const products = getProducts();

  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

  const analytics = {
    ...mockAnalytics,
    totalRevenue: totalRevenue || mockAnalytics.totalRevenue,
    totalOrders: orders.length || mockAnalytics.totalOrders,
    totalProducts: products.length,
    averageOrderValue:
      completedOrders.length > 0
        ? totalRevenue / completedOrders.length
        : mockAnalytics.averageOrderValue,
  };

  return NextResponse.json(analytics);
}
