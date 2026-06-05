import { NextResponse } from "next/server";
import { getProductById, updateProduct, deleteProduct } from "@/lib/db";
import { productSchema } from "@/lib/validations/product";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const product = getProductById(params.id);
  if (!product) {
    return NextResponse.json({ message: "Produk tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const parsed = productSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Validasi gagal" },
        { status: 400 }
      );
    }

    const product = updateProduct(params.id, parsed.data);
    if (!product) {
      return NextResponse.json({ message: "Produk tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const deleted = deleteProduct(params.id);
  if (!deleted) {
    return NextResponse.json({ message: "Produk tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
