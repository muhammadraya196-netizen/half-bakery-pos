import { NextResponse } from "next/server";
import { getProducts, getStockMovements } from "@/lib/db";
import { buildStockOverview } from "@/lib/services/stock-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const overview = buildStockOverview(getProducts(), getStockMovements());
  return NextResponse.json(overview);
}
