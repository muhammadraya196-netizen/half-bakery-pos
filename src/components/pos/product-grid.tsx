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
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ProductGrid({
  products,
  isLoading,
  emptyTitle = "Tidak ada produk",
  emptyDescription = "Coba ubah filter atau kata kunci pencarian",
}: ProductGridProps) {
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
        <p className="text-lg font-medium">{emptyTitle}</p>
        {emptyDescription ? (
          <p className="text-sm">{emptyDescription}</p>
        ) : null}
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
              {product.isPromoBundling && product.promoLabel ? (
                <Badge className="absolute top-2 left-2 text-[10px] px-1.5 py-0 border-0 z-10">
                  {product.promoLabel}
                </Badge>
              ) : product.isBestSeller ? (
                <Badge className="absolute top-2 left-2 text-[10px] px-1.5 py-0 border-0 z-10">
                  Best
                </Badge>
              ) : null}
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm leading-tight line-clamp-2">
                {product.name}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                {product.isPromoBundling && product.bundleItems
                  ? product.bundleItems.join(" · ")
                  : product.category}
              </p>
              {product.isPromoBundling && product.savings ? (
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span className="shrink-0 whitespace-nowrap text-sm font-bold text-primary">
                    {formatCurrency(product.price)}
                  </span>
                  <Badge
                    variant="secondary"
                    className="ml-auto shrink-0 whitespace-nowrap text-[10px]"
                  >
                    Hemat {formatCurrency(product.savings)}
                  </Badge>
                  {product.originalPrice ? (
                    <span className="basis-full whitespace-nowrap text-[10px] leading-none text-muted-foreground line-through">
                      {formatCurrency(product.originalPrice)}
                    </span>
                  ) : null}
                </div>
              ) : (
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
              )}
              {product.isPromoBundling && product.stock === 0 && (
                <p className="mt-2 text-xs font-medium text-destructive">
                  Stok tidak cukup
                </p>
              )}
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
