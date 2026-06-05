"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  const addItem = useCartStore((s) => s.addItem);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
              <div className="h-8 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-lg font-medium">Tidak ada produk</p>
        <p className="text-sm">Coba ubah filter atau kata kunci pencarian</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <Card
          key={product.id}
          className="group cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => product.stock > 0 && addItem(product)}
        >
          <CardContent className="p-4">
            <div className="mb-3 flex h-20 items-center justify-center rounded-lg bg-muted/50">
              <span className="text-3xl">
                {getCategoryEmoji(product.category)}
              </span>
            </div>
            <h3 className="font-medium text-sm leading-tight line-clamp-2">
              {product.name}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{product.sku}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-bold text-primary">
                {formatCurrency(product.price)}
              </span>
              <Badge variant={product.stock > 10 ? "secondary" : "warning"}>
                Stok: {product.stock}
              </Badge>
            </div>
            <Button
              size="sm"
              className="mt-3 w-full opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={product.stock === 0}
              onClick={(e) => {
                e.stopPropagation();
                addItem(product);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Tambah
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    Makanan: "🍜",
    Minuman: "🥤",
    Snack: "🍿",
    Elektronik: "📱",
    Aksesoris: "🔌",
    Lainnya: "📦",
  };
  return map[category] || "📦";
}
