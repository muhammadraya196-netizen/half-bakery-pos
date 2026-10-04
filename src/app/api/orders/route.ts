import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrders, createOrder } from "@/lib/db";
import { filterSales, sortSales, querySales } from "@/lib/services/sales-service";
import { PAYMENT_METHOD_VALUES } from "@/types";
import type { SalesQuery, SalesSortBy, SortDirection } from "@/types";

export const dynamic = "force-dynamic";

function toNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

const paymentMethodSchema = z.enum(PAYMENT_METHOD_VALUES);

const paymentLineSchema = z.object({
  method: paymentMethodSchema,
  amount: z.number().positive("Nominal harus lebih besar dari 0"),
  cashReceived: z.number().min(0).optional(),
});

function roundRp(value: number): number {
  return Math.round(value);
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
    paymentMethod: paymentMethodSchema,
    payments: z.array(paymentLineSchema).min(1).optional(),
    cashierId: z.string(),
    cashierName: z.string(),
    customerName: z.string().optional(),
    notes: z.string().optional(),
    cashReceived: z.number().min(0).optional(),
    changeAmount: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    const total = roundRp(data.total);

    if (data.payments && data.payments.length > 0) {
      if (data.payments[0].method !== data.paymentMethod) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Metode pembayaran tidak sesuai",
          path: ["paymentMethod"],
        });
      }

      const lines = data.payments.map((line) => ({
        method: line.method,
        amount: roundRp(line.amount),
        cashReceived:
          line.cashReceived === undefined ? undefined : roundRp(line.cashReceived),
      }));

      if (lines.some((line) => !Number.isFinite(line.amount) || line.amount <= 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nominal harus lebih besar dari 0",
          path: ["payments"],
        });
        return;
      }

      const paid = lines.reduce((sum, line) => sum + line.amount, 0);
      let expectedChange = 0;

      if (lines.length === 1 && lines[0].method === "cash") {
        const tendered = lines[0].cashReceived ?? lines[0].amount;
        if (tendered < total) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Nominal pembayaran kurang dari total tagihan",
            path: ["cashReceived"],
          });
          return;
        }
        if (lines[0].amount !== total) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Nominal pembayaran tidak sesuai total tagihan",
            path: ["payments"],
          });
          return;
        }
        expectedChange = tendered - total;
      } else if (paid > total) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Total pembayaran melebihi total tagihan.",
          path: ["payments"],
        });
        return;
      } else if (paid < total) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nominal pembayaran kurang dari total tagihan",
          path: ["payments"],
        });
        return;
      } else {
        for (const line of lines) {
          if (line.method !== "cash") continue;
          const tendered = line.cashReceived ?? line.amount;
          if (tendered < line.amount) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Uang diterima kurang dari jumlah pembayaran tunai",
              path: ["payments"],
            });
            return;
          }
          expectedChange += tendered - line.amount;
        }
      }

      const reportedChange = roundRp(data.changeAmount ?? 0);
      if (reportedChange !== expectedChange) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Perhitungan kembalian tidak valid",
          path: ["changeAmount"],
        });
      }
      return;
    }

    // Transaksi lama: satu metode, tanpa array payments.
    if (data.paymentMethod === "cash") {
      if (data.cashReceived === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Uang dibayar wajib diisi untuk pembayaran tunai",
          path: ["cashReceived"],
        });
        return;
      }
      if (data.cashReceived < total) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nominal pembayaran kurang dari total tagihan",
          path: ["cashReceived"],
        });
        return;
      }
      const expectedChange = roundRp(data.cashReceived) - total;
      if (roundRp(data.changeAmount ?? 0) !== expectedChange) {
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
