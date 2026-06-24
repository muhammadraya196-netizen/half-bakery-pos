"use client";

import { Star, ShoppingBag, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductImage } from "@/components/bakery/product-image";
import type { Product } from "@/types";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.04 }}
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-bakery hover:shadow-bakery-lg transition-all duration-300 border border-border/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-cream/30">
        <ProductImage
          name={product.name}
          category={product.category}
          src={product.image}
          alt={product.name}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bakery-dark/50 via-bakery-dark/5 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 pointer-events-none" />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isBestSeller && (
            <Badge className="bg-primary text-primary-foreground border-0 shadow-md text-[10px] font-semibold tracking-wide">
              Best Seller
            </Badge>
          )}
          {product.badge === "new" && (
            <Badge className="bg-emerald-600 text-white border-0 shadow-md text-[10px] font-semibold tracking-wide">
              New
            </Badge>
          )}
          {product.badge === "limited" && (
            <Badge className="bg-bakery-dark text-white border-0 shadow-md text-[10px] font-semibold tracking-wide">
              Limited
            </Badge>
          )}
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm z-10">
          <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
          <span className="text-xs font-bold text-bakery-dark">
            {product.rating?.toFixed(1) ?? "4.8"}
          </span>
        </div>

        {product.isCustomerFavorite && (
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/95 backdrop-blur-sm px-3 py-1 text-[10px] font-semibold text-bakery-dark shadow-sm">
              <Heart className="h-3 w-3 fill-primary text-primary" />
              Customer Favorite
            </span>
          </div>
        )}
      </div>

      <div className="p-4 md:p-5">
        <p className="text-[11px] font-semibold text-secondary uppercase tracking-widest mb-1.5">
          {product.category}
        </p>
        <h3 className="font-display text-lg font-bold text-bakery-dark mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[2.5rem] leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between gap-3 pt-1 border-t border-border/50">
          <span className="font-display text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          <Button
            size="sm"
            className={cn(
              "rounded-xl gap-1.5 h-9 px-4 font-semibold",
              "transition-all duration-300 group-hover:shadow-md active:scale-95"
            )}
            onClick={() => addItem(product)}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Tambah</span>
          </Button>
        </div>
      </div>
    </motion.article>
  );
}
