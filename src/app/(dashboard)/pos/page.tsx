"use client";

import { Suspense, useState } from "react";
import { Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/pos/product-grid";
import { CartPanel } from "@/components/pos/cart-panel";
import { PromoAutoApply } from "@/components/pos/promo-auto-apply";
import { PromoBanner } from "@/components/pos/promo-banner";
import { useProducts } from "@/hooks/use-products";
import { CATEGORIES, PROMO_BUNDLING_PRODUCTS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const PROMO_BUNDLING_FILTER = "promo-bundling";

function matchesBundleSearch(product: Product, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  const haystack = [
    product.name,
    product.description,
    product.sku,
    product.promoLabel,
    ...(product.bundleItems ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export default function POSPage() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const isPromoBundling = category === PROMO_BUNDLING_FILTER;

  const { data: products, isLoading } = useProducts({
    category:
      !isPromoBundling && category !== "all" ? category : undefined,
    search: search || undefined,
  });

  const visibleProducts = isPromoBundling
    ? PROMO_BUNDLING_PRODUCTS.filter((product) =>
        matchesBundleSearch(product, search)
      )
    : (products ?? []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <>
      <Header title="Kasir (POS)" description="Proses transaksi penjualan" />
      <Suspense fallback={null}>
        <PromoAutoApply />
      </Suspense>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        <div className="flex-1 overflow-auto p-4 space-y-4 min-h-0">
          <PromoBanner />
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari produk, SKU, atau kategori..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              Cari
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={category === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory("all")}
            >
              Semua
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat)}
                className={cn(category === cat && "bg-primary")}
              >
                {cat}
              </Button>
            ))}
            <Button
              variant={isPromoBundling ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory(PROMO_BUNDLING_FILTER)}
              className={cn(isPromoBundling && "bg-primary")}
            >
              Promo Bundling
            </Button>
          </div>

          <ProductGrid
            products={visibleProducts}
            isLoading={isPromoBundling ? false : isLoading}
            emptyTitle={
              isPromoBundling ? "Tidak ada promo bundling tersedia." : undefined
            }
            emptyDescription={isPromoBundling ? "" : undefined}
          />
        </div>

        <div className="w-full lg:w-[26rem] xl:w-96 shrink-0 border-t lg:border-t-0 lg:border-l bg-muted/30 p-4 min-h-[420px] lg:min-h-0">
          <CartPanel />
        </div>
      </div>
    </>
  );
}
