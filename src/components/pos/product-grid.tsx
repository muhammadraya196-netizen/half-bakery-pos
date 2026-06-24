"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/bakery/product-image";
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
          <Card key={i} className="animate-pulse rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-[4/3] bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
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
          className="group cursor-pointer transition-all hover:shadow-bakery rounded-2xl overflow-hidden border-border/50"
          onClick={() => product.stock > 0 && addItem(product)}
        >
          <CardContent className="p-0">
            <div className="relative aspect-[4/3] overflow-hidden bg-cream/30">
              <ProductImage
                name={product.name}
                category={product.category}
                src={product.image}
                alt={product.name}
                sizes="200px"
                className="transition-transform group-hover:scale-105"
              />
              {product.isBestSeller && (
                <Badge className="absolute top-2 left-2 text-[10px] px-1.5 py-0 border-0 z-10">
                  Best
                </Badge>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm leading-tight line-clamp-2">
                {product.name}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {product.category}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-bold text-primary text-sm">
                  {formatCurrency(product.price)}
                </span>
                <Badge
                  variant={product.stock > 10 ? "secondary" : "warning"}
                  className="text-[10px]"
                >
                  {product.stock}
                </Badge>
              </div>
              <Button
                size="sm"
                className="mt-2 w-full rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={product.stock === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  addItem(product);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
