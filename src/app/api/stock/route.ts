import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getStockMovements,
  createStockMovement,
  StockError,
} from "@/lib/db";
import { queryMovements } from "@/lib/services/stock-service";
import type { StockMovementType, StockQuery } from "@/types";

export const dynamic = "force-dynamic";

function toNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const query: StockQuery = {
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    productId: searchParams.get("productId") ?? undefined,
    supplier: searchParams.get("supplier") ?? undefined,
    type: (searchParams.get("type") as StockMovementType | "all") ?? undefined,
    limit: toNumber(searchParams.get("limit")),
    offset: toNumber(searchParams.get("offset")),
  };

  return NextResponse.json(queryMovements(await getStockMovements(), query));
}

const stockMovementSchema = z.object({
  type: z.enum(["in", "out"]),
  productId: z.string().min(1, "Produk wajib dipilih"),
  supplier: z.string().optional(),
  unit: z.string().optional(),
  quantity: z.number().positive("Jumlah harus lebih dari 0"),
  purchasePrice: z.number().min(0, "Harga beli tidak boleh negatif").optional(),
  reason: z
    .enum(["Penjualan", "Produk Rusak", "Kadaluarsa", "Sampel", "Retur", "Lainnya"])
    .optional(),
  note: z.string().optional(),
  officerId: z.string().min(1),
  officerName: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = stockMovementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Validasi gagal" },
        { status: 400 }
      );
    }

    if (parsed.data.type === "in" && !parsed.data.supplier) {
      return NextResponse.json(
        { message: "Supplier wajib dipilih" },
        { status: 400 }
      );
    }

    const movement = await createStockMovement(parsed.data);
    return NextResponse.json(movement, { status: 201 });
  } catch (err) {
    if (err instanceof StockError) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
