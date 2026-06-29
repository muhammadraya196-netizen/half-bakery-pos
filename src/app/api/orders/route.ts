import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrders, createOrder } from "@/lib/db";
import { filterSales, sortSales, querySales } from "@/lib/services/sales-service";
import type { SalesQuery, SalesSortBy, SortDirection } from "@/types";

export const dynamic = "force-dynamic";

function toNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

const createOrderSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z.string(),
          productName: z.string(),
          quantity: z.number().int().positive(),
          price: z.number().min(0),
          subtotal: z.number().min(0),
        })
      )
      .min(1, "Keranjang kosong"),
    subtotal: z.number().min(0),
    tax: z.number().min(0),
    discount: z.number().min(0),
    total: z.number().min(0),
    paymentMethod: z.enum(["cash", "card", "qris", "transfer"]),
    cashierId: z.string(),
    cashierName: z.string(),
    customerName: z.string().optional(),
    notes: z.string().optional(),
    cashReceived: z.number().min(0).optional(),
    changeAmount: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === "cash") {
      if (data.cashReceived === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Uang dibayar wajib diisi untuk pembayaran tunai",
          path: ["cashReceived"],
        });
        return;
      }
      if (data.cashReceived < data.total) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nominal pembayaran kurang dari total tagihan",
          path: ["cashReceived"],
        });
        return;
      }
      const expectedChange = data.cashReceived - data.total;
      if (data.changeAmount !== expectedChange) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Perhitungan kembalian tidak valid",
          path: ["changeAmount"],
        });
      }
    }
  });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const query: SalesQuery = {
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    sortBy: (searchParams.get("sortBy") as SalesSortBy) ?? undefined,
    sortDir: (searchParams.get("sortDir") as SortDirection) ?? undefined,
    limit: toNumber(searchParams.get("limit")),
    offset: toNumber(searchParams.get("offset")),
  };

  const orders = getOrders();

  // Backward compatible: tanpa `limit` → kembalikan array (dipakai dashboard).
  // Dengan `limit` → kembalikan envelope { data, total, limit, offset, summary }.
  if (query.limit === undefined) {
    return NextResponse.json(sortSales(filterSales(orders, query), query));
  }

  return NextResponse.json(querySales(orders, query));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Validasi gagal" },
        { status: 400 }
      );
    }

    const order = createOrder({
      ...parsed.data,
      status: "completed",
    });

    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
