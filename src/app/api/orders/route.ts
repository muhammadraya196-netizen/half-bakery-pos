import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrders, createOrder } from "@/lib/db";

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
  const status = searchParams.get("status");

  let orders = getOrders();

  if (status && status !== "all") {
    orders = orders.filter((o) => o.status === status);
  }

  return NextResponse.json(orders);
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
