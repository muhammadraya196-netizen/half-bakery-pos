import { NextResponse } from "next/server";
import { getProducts, getStockMovements } from "@/lib/db";
import { buildStockOverview } from "@/lib/services/stock-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const [products, movements] = await Promise.all([getProducts(), getStockMovements()]);
  const overview = buildStockOverview(products, movements);
  return NextResponse.json(overview);
}
