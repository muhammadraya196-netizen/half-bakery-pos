import { NextResponse } from "next/server";
import { getProducts, createProduct } from "@/lib/db";
import { productSchema } from "@/lib/validations/product";
import { queryProducts, filterProducts } from "@/lib/services/product-service";
import type { ProductQuery, ProductStatus } from "@/types";

export const dynamic = "force-dynamic";

/** Ubah string param → number bila valid, jika tidak undefined. */
function toNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const query: ProductQuery = {
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    status: (searchParams.get("status") as ProductStatus) ?? undefined,
    minPrice: toNumber(searchParams.get("minPrice")),
    maxPrice: toNumber(searchParams.get("maxPrice")),
    minStock: toNumber(searchParams.get("minStock")),
    limit: toNumber(searchParams.get("limit")),
    offset: toNumber(searchParams.get("offset")),
  };

  const products = getProducts();

  // Backward compatible: tanpa `limit` → kembalikan array penuh (dipakai POS & menu).
  // Dengan `limit` → kembalikan envelope paginasi { data, total, limit, offset }.
  if (query.limit === undefined) {
    return NextResponse.json(filterProducts(products, query));
  }

  return NextResponse.json(queryProducts(products, query));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Validasi gagal" },
        { status: 400 }
      );
    }

    const product = createProduct({
      ...parsed.data,
      description: parsed.data.description || "",
    });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
